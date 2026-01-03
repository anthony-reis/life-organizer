import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

import { BookOpen } from "lucide-react";
import ReadingProgress from "./_components/reading-progress";
import ReadingWeeks from "./_components/reading-weeks";

async function ReadingPlan() {
  const supabase = await createClient();
  const anoAtual = new Date().getFullYear();

  const { data: plano } = await supabase
    .from("plano_leitura")
    .select("*")
    .eq("ano", anoAtual)
    .order("semana");

  const { data: recompensas } = await supabase
    .from("recompensas")
    .select("*")
    .order("semanas_necessarias");

  const semanasCompletas = plano?.filter((p) => p.concluido).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-cyan-500" />
        <h1 className="text-3xl font-bold text-cyan-600">Leitura {anoAtual}</h1>
      </div>

      {/* Progresso */}
      <ReadingProgress
        semanasCompletas={semanasCompletas}
        totalSemanas={52}
        recompensas={recompensas || []}
      />

      {/* Semanas */}
      <ReadingWeeks plano={plano || []} />
    </div>
  );
}

export default function ReadingPage() {
  return (
    <Suspense fallback={<div>Carregando plano de leitura...</div>}>
      <div className="px-5 py-8 max-w-4xl mx-auto">
        <ReadingPlan />
      </div>
    </Suspense>
  );
}
