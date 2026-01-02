// app/reading/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";

export async function marcarSemana(planoId: number, concluido: boolean) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

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

  // Verificar e desbloquear recompensas
  const { data: semanasConcluidas } = await supabase
    .from("plano_leitura")
    .select("id")
    .eq("user_id", user.id)
    .eq("concluido", true);

  const totalConcluido = semanasConcluidas?.length || 0;

  // Atualizar recompensas desbloqueadas
  await supabase
    .from("recompensas")
    .update({
      desbloqueada: true,
      data_desbloqueio: new Date().toISOString().split("T")[0],
    })
    .eq("user_id", user.id)
    .lte("semanas_necessarias", totalConcluido)
    .eq("desbloqueada", false);

  return { success: true, totalConcluido };
}

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
    console.error("Erro ao salvar anotação:", error);
    return { error: error.message };
  }

  return { success: true };
}

export async function editarLivroSemana(planoId: number, novoTitulo: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Não autenticado" };
  }

  const { error } = await supabase
    .from("plano_leitura")
    .update({ livro_titulo: novoTitulo })
    .eq("id", planoId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
