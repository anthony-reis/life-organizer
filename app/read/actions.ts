"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Função auxiliar para calcular data da semana ISO
function getDateOfISOWeek(week: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  return ISOweekStart;
}

// Função para obter início e fim de uma semana
function getDatasInicioFimSemana(
  semana: number,
  ano: number
): { inicio: string; fim: string } {
  const dataInicio = getDateOfISOWeek(semana, ano);
  const dataFim = new Date(dataInicio);
  dataFim.setDate(dataFim.getDate() + 6); // +6 dias = domingo

  return {
    inicio: dataInicio.toISOString().split("T")[0],
    fim: dataFim.toISOString().split("T")[0],
  };
}

// ========== GERENCIAR HÁBITO DE LEITURA ==========

async function criarOuAtualizarHabitoLeitura(
  user_id: string,
  livro_titulo: string,
  semana: number,
  ano: number
) {
  const supabase = await createClient();

  const { inicio, fim } = getDatasInicioFimSemana(semana, ano);

  console.log(
    `Criando hábito de leitura "${livro_titulo}" - ${inicio} a ${fim}`
  );

  // Verificar se já existe hábito de leitura para este livro
  const { data: habitoExistente } = await supabase
    .from("habitos")
    .select("id, nome, ativo")
    .eq("user_id", user_id)
    .ilike("nome", `%${livro_titulo}%`)
    .maybeSingle();

  if (habitoExistente) {
    // Atualizar datas do hábito existente
    await supabase
      .from("habitos")
      .update({
        data_inicio: inicio,
        data_fim: fim,
        ativo: true,
      })
      .eq("id", habitoExistente.id);

    console.log(`✅ Hábito de leitura atualizado: ${livro_titulo}`);
    return habitoExistente.id;
  } else {
    // 🔥 CRIAR NOVO HÁBITO - DIARIO + data_inicio/fim = todos os dias do range
    const { data, error } = await supabase
      .from("habitos")
      .insert({
        user_id,
        nome: `Ler: ${livro_titulo} 📚`,
        descricao: `Leitura de "${livro_titulo}" - Semana ${semana}/${ano}`,
        periodicidade: "DIARIO",
        dias_semana: ["1", "2", "3", "4", "5"],
        data_inicio: inicio,
        data_fim: fim,
        xp_ganho: 15,
        ativo: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar hábito:", error);
      return null;
    }

    if (data) {
      console.log(
        `✅ Hábito de leitura criado: ${livro_titulo} (${inicio} a ${fim})`
      );
      return data.id;
    }

    return null;
  }
}

async function desativarHabitoLeitura(user_id: string, livro_titulo: string) {
  const supabase = await createClient();

  await supabase
    .from("habitos")
    .update({ ativo: false })
    .eq("user_id", user_id)
    .ilike("nome", `%${livro_titulo}%`);

  console.log(`✅ Hábito de leitura desativado: ${livro_titulo}`);
}

// ========== ADICIONAR LIVRO ==========

export async function adicionarLivro(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  const livro_titulo = formData.get("livro_titulo") as string;
  const semana = parseInt(formData.get("semana") as string);
  const ano = parseInt(formData.get("ano") as string);

  if (!livro_titulo || !semana || !ano) {
    return { success: false, error: "Dados inválidos" };
  }

  if (semana < 1 || semana > 53) {
    return { success: false, error: "Semana deve ser entre 1 e 53" };
  }

  const { error } = await supabase.from("plano_leitura").insert({
    user_id: user.id,
    semana,
    ano,
    livro_titulo,
    concluido: false,
  });

  if (error) {
    console.error("Erro ao adicionar livro:", error);
    return {
      success: false,
      error:
        "Erro ao adicionar livro. Verifique se já existe um livro para esta semana.",
    };
  }

  // 🔥 CRIAR HÁBITO COM data_inicio e data_fim
  await criarOuAtualizarHabitoLeitura(user.id, livro_titulo, semana, ano);

  revalidatePath("/read");
  return { success: true };
}

// ========== EDITAR LIVRO ==========

export async function editarLivro(id: number, livro_titulo: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  // Buscar informações do livro
  const { data: livroAntigo } = await supabase
    .from("plano_leitura")
    .select("livro_titulo, semana, ano")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("plano_leitura")
    .update({ livro_titulo })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Erro ao editar livro" };
  }

  // 🔥 ATUALIZAR NOME DO HÁBITO
  if (livroAntigo) {
    await supabase
      .from("habitos")
      .update({
        nome: `Ler: ${livro_titulo} 📚`,
        descricao: `Leitura de "${livro_titulo}" - Semana ${livroAntigo.semana}/${livroAntigo.ano}`,
      })
      .eq("user_id", user.id)
      .ilike("nome", `%${livroAntigo.livro_titulo}%`);

    console.log(`✅ Nome do hábito atualizado: ${livro_titulo}`);
  }

  revalidatePath("/read");
  return { success: true };
}

// ========== DELETAR LIVRO ==========

export async function deletarLivro(id: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  // Buscar livro antes de deletar
  const { data: livro } = await supabase
    .from("plano_leitura")
    .select("livro_titulo")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("plano_leitura")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Erro ao deletar livro" };
  }

  // 🔥 DESATIVAR HÁBITO
  if (livro) {
    await desativarHabitoLeitura(user.id, livro.livro_titulo);
  }

  revalidatePath("/read");
  return { success: true };
}

// ========== MARCAR SEMANA ==========

export async function marcarSemana(planoId: number, concluido: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  // Buscar informações do livro
  const { data: livro } = await supabase
    .from("plano_leitura")
    .select("livro_titulo, semana, ano")
    .eq("id", planoId)
    .single();

  const updateData: any = {
    concluido,
  };

  if (concluido) {
    updateData.data_conclusao = new Date().toISOString().split("T")[0];
  } else {
    updateData.data_conclusao = null;
  }

  const { error } = await supabase
    .from("plano_leitura")
    .update(updateData)
    .eq("id", planoId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao atualizar:", error);
    return { error: error.message };
  }

  // 🔥 MARCAR HÁBITO SE CONCLUÍDO
  if (livro && concluido) {
    try {
      // Buscar hábito relacionado
      const { data: habito } = await supabase
        .from("habitos")
        .select("id, xp_ganho")
        .eq("user_id", user.id)
        .ilike("nome", `%${livro.livro_titulo}%`)
        .maybeSingle();

      if (habito) {
        const { inicio, fim } = getDatasInicioFimSemana(
          livro.semana,
          livro.ano
        );

        // Marcar todos os dias da semana como concluídos
        const dataInicio = new Date(inicio);
        const dias: string[] = [];

        for (let i = 0; i < 7; i++) {
          const data = new Date(dataInicio);
          data.setDate(data.getDate() + i);
          dias.push(data.toISOString().split("T")[0]);
        }

        for (const dia of dias) {
          await supabase.from("habitos_tracking").upsert(
            {
              habito_id: habito.id,
              user_id: user.id,
              data: dia,
              concluido: true,
              xp_ganho: habito.xp_ganho,
              xp_perdido: 0,
              concluido_em: new Date().toISOString(),
            },
            {
              onConflict: "habito_id,data",
            }
          );
        }

        // Atualizar XP
        const xpTotal = habito.xp_ganho * 7;
        const { data: xpData } = await supabase
          .from("usuario_xp")
          .select("xp_total, level")
          .eq("user_id", user.id)
          .single();

        const novoXP = (xpData?.xp_total || 0) + xpTotal;
        const novoLevel = Math.floor(novoXP / 100) + 1;

        await supabase.from("usuario_xp").upsert({
          user_id: user.id,
          xp_total: novoXP,
          level: novoLevel,
          updated_at: new Date().toISOString(),
        });

        console.log(
          `✅ Hábito marcado para semana ${livro.semana} (+${xpTotal} XP)`
        );
      }
    } catch (habitoError) {
      console.error("Erro ao marcar hábito:", habitoError);
    }
  }

  // Verificar recompensas
  const { data: semanasConcluidas } = await supabase
    .from("plano_leitura")
    .select("id")
    .eq("user_id", user.id)
    .eq("concluido", true);

  const totalConcluido = semanasConcluidas?.length || 0;

  await supabase
    .from("recompensas")
    .update({
      desbloqueada: true,
      data_desbloqueio: new Date().toISOString().split("T")[0],
    })
    .eq("user_id", user.id)
    .lte("semanas_necessarias", totalConcluido)
    .eq("desbloqueada", false);

  revalidatePath("/read");
  return { success: true, totalConcluido };
}

// ========== SALVAR ANOTAÇÃO ==========

export async function salvarAnotacao(planoId: number, observacoes: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("plano_leitura")
    .update({ observacoes: observacoes.trim() || null })
    .eq("id", planoId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/read");
  return { success: true };
}

// ========== EDITAR LIVRO SEMANA ==========

export async function editarLivroSemana(planoId: number, novoTitulo: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { data: livroAntigo } = await supabase
    .from("plano_leitura")
    .select("livro_titulo")
    .eq("id", planoId)
    .single();

  const { error } = await supabase
    .from("plano_leitura")
    .update({ livro_titulo: novoTitulo })
    .eq("id", planoId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  if (livroAntigo) {
    await supabase
      .from("habitos")
      .update({ nome: `Ler: ${novoTitulo} 📚` })
      .eq("user_id", user.id)
      .ilike("nome", `%${livroAntigo.livro_titulo}%`);
  }

  revalidatePath("/read");
  return { success: true };
}
