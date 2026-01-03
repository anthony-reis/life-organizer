"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Mapear dias da semana para números
const DIA_SEMANA_TO_NUMBER: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

// ========== GERENCIAR HÁBITO DE TREINO ==========

async function criarOuAtualizarHabitoTreino(user_id: string) {
  const supabase = await createClient();

  // Buscar todos os dias que têm treino
  const { data: diasComTreino } = await supabase
    .from("treino_exercicios")
    .select("dia_semana")
    .eq("user_id", user_id)
    .eq("ativo", true);

  if (!diasComTreino || diasComTreino.length === 0) {
    console.log("Nenhum treino programado");

    // Desativar hábito de treino se não houver mais treinos
    await supabase
      .from("habitos")
      .update({ ativo: false })
      .eq("user_id", user_id)
      .ilike("nome", "%treino%");

    console.log("✅ Hábito de treino desativado (sem treinos programados)");
    return;
  }

  // Contar dias únicos e converter para números
  const diasUnicos = [...new Set(diasComTreino.map((t) => t.dia_semana))];
  const diasNumeros = diasUnicos
    .map((dia) => DIA_SEMANA_TO_NUMBER[dia])
    .filter((num) => num !== undefined)
    .sort((a, b) => a - b);

  console.log(`Treino programado para:`, diasUnicos);
  console.log(`Dias em números:`, diasNumeros);

  // Definir periodicidade baseado na quantidade de dias
  let periodicidade = "SEMANAL";
  if (diasNumeros.length === 7) {
    periodicidade = "DIARIO";
  } else if (diasNumeros.length >= 5) {
    periodicidade = "CINCO_SEMANA";
  } else if (diasNumeros.length >= 3) {
    periodicidade = "TRES_SEMANA";
  }

  // Verificar se já existe hábito de treino
  const { data: habitoExistente } = await supabase
    .from("habitos")
    .select("id, dias_semana, ativo")
    .eq("user_id", user_id)
    .ilike("nome", "%treino%")
    .maybeSingle();

  if (habitoExistente) {
    // Atualizar dias da semana
    await supabase
      .from("habitos")
      .update({
        dias_semana: diasNumeros,
        periodicidade,
        ativo: true,
      })
      .eq("id", habitoExistente.id);

    console.log(`✅ Hábito de treino atualizado:`, diasUnicos);
  } else {
    // Criar novo hábito
    const { error } = await supabase.from("habitos").insert({
      user_id,
      nome: "Treino 💪",
      descricao: "Treino de academia criado automaticamente",
      periodicidade,
      dias_semana: diasNumeros,
      xp_ganho: 20,
      ativo: true,
    });

    if (!error) {
      console.log(`✅ Hábito de treino criado:`, diasUnicos);
    } else {
      console.error("Erro ao criar hábito:", error);
    }
  }
}

// ========== EXERCÍCIOS ==========

export async function criarExercicio(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  const nome = formData.get("nome") as string;
  const grupo_muscular_id = parseInt(
    formData.get("grupo_muscular_id") as string
  );
  const observacoes = formData.get("observacoes") as string;

  if (!nome || !grupo_muscular_id) {
    return { success: false, error: "Dados inválidos" };
  }

  const { data, error } = await supabase
    .from("exercicios")
    .insert({
      user_id: user.id,
      nome: nome.trim(),
      grupo_muscular_id,
      observacoes: observacoes?.trim() || null,
      ativo: true,
    })
    .select()
    .single();

  if (error) {
    console.error("Erro ao criar exercício:", error);
    return { success: false, error: "Erro ao criar exercício" };
  }

  return { success: true, data };
}

// ========== ADICIONAR EXERCÍCIO AO TREINO ==========
export async function adicionarExercicioAoTreino(
  exercicio_id: number,
  dia_semana: string,
  series_planejadas: number,
  repeticoes_planejadas: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  console.log("Adicionando exercício:", {
    exercicio_id,
    dia_semana,
    series_planejadas,
    repeticoes_planejadas,
  });

  // Buscar a maior ordem do dia
  const { data: maxOrdem } = await supabase
    .from("treino_exercicios")
    .select("ordem")
    .eq("user_id", user.id)
    .eq("dia_semana", dia_semana)
    .order("ordem", { ascending: false })
    .limit(1);

  const novaOrdem = maxOrdem && maxOrdem.length > 0 ? maxOrdem[0].ordem + 1 : 1;

  const { error } = await supabase.from("treino_exercicios").insert({
    user_id: user.id,
    exercicio_id,
    dia_semana,
    ordem: novaOrdem,
    series_planejadas,
    repeticoes_planejadas,
    ativo: true,
  });

  if (error) {
    console.error("Erro ao inserir:", error);
    return { success: false, error: "Erro ao adicionar exercício ao treino" };
  }

  // 🔥 CRIAR OU ATUALIZAR HÁBITO DE TREINO
  await criarOuAtualizarHabitoTreino(user.id);

  return { success: true };
}

// ========== REMOVER EXERCÍCIO DO TREINO ==========
export async function removerExercicioDoTreino(treino_exercicio_id: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("treino_exercicios")
    .delete()
    .eq("id", treino_exercicio_id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Erro ao remover exercício" };
  }

  // 🔥 ATUALIZAR HÁBITO DE TREINO
  await criarOuAtualizarHabitoTreino(user.id);

  return { success: true };
}

// ========== EDITAR EXERCÍCIO NO TREINO ==========
export async function editarExercicioTreino(
  treino_exercicio_id: number,
  series_planejadas: number,
  repeticoes_planejadas: string
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("treino_exercicios")
    .update({ series_planejadas, repeticoes_planejadas })
    .eq("id", treino_exercicio_id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: "Erro ao editar exercício" };
  }

  return { success: true };
}
