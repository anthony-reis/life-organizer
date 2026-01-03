// app/habits/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function criarHabito(dados: {
  nome: string;
  descricao: string;
  periodicidade: string;
  diasSemana: number[] | null;
  diaMes: number | null;
  xpGanho: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase.from("habitos").insert({
    user_id: user.id,
    nome: dados.nome,
    descricao: dados.descricao || null,
    periodicidade: dados.periodicidade,
    dias_semana: dados.diasSemana,
    dia_mes: dados.diaMes,
    xp_ganho: dados.xpGanho,
    ativo: true,
  });

  if (error) {
    console.error("Erro ao criar hábito:", error);
    return { error: error.message };
  }

  revalidatePath("/habits");
  return { success: true };
}

export async function marcarHabito(habitoId: number, concluido: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const hoje = new Date().toISOString().split("T")[0];

  // Buscar dados do hábito
  const { data: habito } = await supabase
    .from("habitos")
    .select("xp_ganho")
    .eq("id", habitoId)
    .single();

  if (!habito) {
    return { error: "Hábito não encontrado" };
  }

  const xpGanho = concluido ? habito.xp_ganho : 0;
  const xpPerdido = concluido ? 0 : habito.xp_ganho * 2;

  // Inserir ou atualizar tracking
  const { error: trackingError } = await supabase
    .from("habitos_tracking")
    .upsert(
      {
        habito_id: habitoId,
        user_id: user.id,
        data: hoje,
        concluido,
        xp_ganho: xpGanho,
        xp_perdido: 0,
        concluido_em: concluido ? new Date().toISOString() : null,
      },
      {
        onConflict: "habito_id,data",
      }
    );

  if (trackingError) {
    console.error("Erro ao marcar hábito:", trackingError);
    return { error: trackingError.message };
  }

  // Atualizar XP do usuário
  if (concluido) {
    // Ganhar XP
    const { data: xpData } = await supabase
      .from("usuario_xp")
      .select("xp_total, level")
      .eq("user_id", user.id)
      .single();

    const novoXP = (xpData?.xp_total || 0) + xpGanho;
    const novoLevel = Math.floor(novoXP / 100) + 1;

    await supabase.from("usuario_xp").upsert({
      user_id: user.id,
      xp_total: novoXP,
      level: novoLevel,
      updated_at: new Date().toISOString(),
    });
  }

  revalidatePath("/habits");
  return { success: true, xp: xpGanho };
}

export async function deletarHabito(habitoId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("habitos")
    .delete()
    .eq("id", habitoId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao deletar hábito:", error);
    return { error: error.message };
  }

  revalidatePath("/habits");
  return { success: true };
}

export async function editarHabito(
  habitoId: number,
  dados: {
    nome: string;
    descricao: string;
    periodicidade: string;
    diasSemana: number[] | null;
    diaMes: number | null;
    xpGanho: number;
  }
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("habitos")
    .update({
      nome: dados.nome,
      descricao: dados.descricao || null,
      periodicidade: dados.periodicidade,
      dias_semana: dados.diasSemana,
      dia_mes: dados.diaMes,
      xp_ganho: dados.xpGanho,
    })
    .eq("id", habitoId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Erro ao editar hábito:", error);
    return { error: error.message };
  }

  revalidatePath("/habits");
  return { success: true };
}
