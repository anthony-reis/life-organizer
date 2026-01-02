import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";
import { ArrowLeftCircleIcon, BarChart3, TrendingUp } from "lucide-react";
import StatsCharts from "./_components/stats-charts";
import Link from "next/link";

async function WorkoutStats() {
  const supabase = await createClient();

  // Buscar evolução geral
  const { data: evolucaoGeral } = await supabase
    .from("v_evolucao_exercicio")
    .select("*")
    .order("exercicio");

  // Buscar histórico completo dos últimos 90 dias
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - 90);
  const dataLimiteStr = dataLimite.toISOString().split("T")[0];

  const { data: historico } = await supabase
    .from("v_historico_completo")
    .select("*")
    .gte("data_treino", dataLimiteStr)
    .order("data_treino", { ascending: true });

  if (!historico || historico.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 text-center">
        <BarChart3 className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-cyan-600 mb-2">
          Sem dados ainda
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Comece a treinar para ver suas estatísticas! 💪
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Link href={"/workout"}>
        <ArrowLeftCircleIcon className="text-cyan-500" size={40} />
      </Link>
      <div className="flex items-center justify-center gap-3">
        <TrendingUp className="w-8 h-8 text-cyan-500" />
        <h1 className="text-3xl font-bold text-cyan-600">
          Estatísticas de Treino
        </h1>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total de Treinos
          </p>
          <p className="text-3xl font-bold text-cyan-600">
            {[...new Set(historico.map((h) => h.data_treino))].length}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Total de Séries
          </p>
          <p className="text-3xl font-bold text-green-600">
            {historico.length}
          </p>
        </div>

        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Exercícios Diferentes
          </p>
          <p className="text-3xl font-bold text-purple-600">
            {[...new Set(historico.map((h) => h.exercicio))].length}
          </p>
        </div>
      </div>

      <StatsCharts historico={historico} evolucaoGeral={evolucaoGeral || []} />
    </div>
  );
}

export default function StatsPage() {
  return (
    <Suspense fallback={<div>Carregando estatísticas...</div>}>
      <div className="px-5 py-8 max-w-7xl mx-auto">
        <WorkoutStats />
      </div>
    </Suspense>
  );
}
