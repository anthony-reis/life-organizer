// app/workout/manage/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { Dumbbell, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import WorkoutManager from "./_components/workout-manager";

async function ManageWorkout() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Por favor, faça login para gerenciar seus treinos.
        </p>
        <Link
          href="/auth/login"
          className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  // Buscar exercícios do usuário
  const { data: exerciciosRaw } = await supabase
    .from("exercicios")
    .select(
      `
      id,
      nome,
      observacoes,
      grupo_muscular_id,
      grupos_musculares!grupo_muscular_id (
        nome
      )
    `
    )
    .eq("user_id", user.id)
    .eq("ativo", true)
    .order("nome");

  // Transformar para o formato correto
  const exercicios =
    exerciciosRaw?.map((ex: any) => ({
      id: ex.id,
      nome: ex.nome,
      observacoes: ex.observacoes,
      grupos_musculares: ex.grupos_musculares || null,
    })) || [];

  // Buscar grupos musculares
  const { data: grupos } = await supabase
    .from("grupos_musculares")
    .select("id, nome")
    .order("nome");

  // Buscar treino semanal
  const { data: treinoSemanalRaw } = await supabase
    .from("treino_exercicios")
    .select(
      `
      id,
      dia_semana,
      ordem,
      series_planejadas,
      repeticoes_planejadas,
      exercicio_id,
      exercicios!exercicio_id (
        nome,
        grupo_muscular_id,
        grupos_musculares!grupo_muscular_id (
          nome
        )
      )
    `
    )
    .eq("user_id", user.id)
    .eq("ativo", true)
    .order("dia_semana")
    .order("ordem");

  // Transformar para o formato correto
  const treinoSemanal =
    treinoSemanalRaw?.map((t: any) => ({
      id: t.id,
      dia_semana: t.dia_semana,
      ordem: t.ordem,
      series_planejadas: t.series_planejadas,
      repeticoes_planejadas: t.repeticoes_planejadas,
      exercicios: {
        nome: t.exercicios?.nome || "Exercício sem nome",
        grupos_musculares: t.exercicios?.grupos_musculares || null,
      },
    })) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/workout">
            <ArrowLeftCircle className="w-8 h-8 text-cyan-500 hover:text-cyan-600 cursor-pointer" />
          </Link>
          <Dumbbell className="w-8 h-8 text-cyan-500" />
          <h1 className="text-3xl font-bold text-cyan-600">
            Gerenciar Treinos
          </h1>
        </div>
      </div>

      <WorkoutManager
        exercicios={exercicios}
        grupos={grupos || []}
        treinoSemanal={treinoSemanal}
      />
    </div>
  );
}

export default function ManagePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
        </div>
      }
    >
      <div className="px-5 py-8 max-w-7xl mx-auto">
        <ManageWorkout />
      </div>
    </Suspense>
  );
}
