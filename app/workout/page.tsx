import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import WorkoutSession from "./_components/workout-session";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

async function WorkoutDay() {
  const supabase = await createClient();

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long" });
  const todayIs = today.replace("-feira", "");
  const dataHoje = new Date().toISOString().split("T")[0];

  // Verificar se já treinou hoje com detalhes
  const { data: treinoFeito, error: erroHistorico } = await supabase
    .from("v_historico_completo")
    .select("exercicio, peso_kg, repeticoes, serie_numero, grupo_muscular")
    .eq("data_treino", dataHoje);

  if (erroHistorico) {
    console.error("Erro ao verificar histórico:", erroHistorico);
  }

  // Se já treinou hoje
  if (treinoFeito && treinoFeito.length > 0) {
    const exerciciosRealizados = [
      ...new Set(treinoFeito.map((t) => t.exercicio)),
    ];
    const totalSeries = treinoFeito.length;

    return (
      <div className="space-y-4">
        <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Treino já realizado! ✅
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Você já registrou seu treino hoje. Descanse e volte amanhã! 💪
          </p>
          <div className="flex gap-4 justify-center text-sm">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 font-semibold">
              {exerciciosRealizados.length} exercícios
            </span>
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 font-semibold">
              {totalSeries} séries
            </span>
          </div>
        </div>

        {/* Resumo do treino */}
        <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="font-bold text-lg mb-4 text-gray-800 dark:text-gray-100">
            Resumo do treino
          </h3>
          <div className="space-y-3">
            {exerciciosRealizados.map((exercicio) => {
              const series = treinoFeito.filter(
                (t) => t.exercicio === exercicio
              );
              return (
                <div
                  key={exercicio}
                  className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0"
                >
                  <p className="font-semibold text-gray-800 dark:text-gray-100 mb-1">
                    {exercicio}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {series.map((serie, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        {serie.peso_kg}kg × {serie.repeticoes}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Buscar treino do dia
  const { data: workoutToday, error } = await supabase
    .from("v_treino_dia")
    .select("*")
    .eq("dia_semana", todayIs)
    .order("ordem");

  if (error) {
    return (
      <div className="text-red-500 p-4">
        <h2>Erro ao carregar treino:</h2>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  if (!workoutToday || workoutToday.length === 0) {
    return (
      <div className="p-6 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20">
        <p className="text-gray-600 dark:text-gray-400 text-center text-lg">
          Hoje é dia de descanso! 💤
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="capitalize font-bold text-3xl text-cyan-600 mb-6">
        Treino de {todayIs} 🔥
      </h1>
      <WorkoutSession exercises={workoutToday} />
    </div>
  );
}

export default function WorkoutPage() {
  return (
    <Suspense fallback={<div>Carregando treino...</div>}>
      <div className="px-5 py-8 max-w-4xl mx-auto">
        <WorkoutDay />
        <Link
          href="/workout/stats"
          className="mt-6 inline-block text-sm text-cyan-600 hover:underline"
        >
          Ver estatísticas de treino 📊
        </Link>
      </div>
    </Suspense>
  );
}
