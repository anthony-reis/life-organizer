"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import WorkoutSession from "./_components/workout-session";
import DaysCarousel from "./_components/days-carousel";
import { CheckCircle2, Dumbbell, Settings, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

const DIA_SEMANA_MAP: Record<number, string> = {
  0: "domingo",
  1: "segunda",
  2: "terca",
  3: "quarta",
  4: "quinta",
  5: "sexta",
  6: "sabado",
};

export default function WorkoutPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [workoutToday, setWorkoutToday] = useState<any[]>([]);
  const [treinoFeito, setTreinoFeito] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      loadWorkout();
    }
  }, [selectedDate]);

  async function loadWorkout() {
    if (!selectedDate) return;

    setLoading(true);
    const supabase = createClient();

    // Verificar usuário
    const {
      data: { user: userData },
    } = await supabase.auth.getUser();
    setUser(userData);

    if (!userData) {
      setLoading(false);
      return;
    }

    const dataStr = selectedDate.toISOString().split("T")[0];
    const diaSemana = DIA_SEMANA_MAP[selectedDate.getDay()];

    // Verificar se já treinou na data selecionada
    const { data: historico } = await supabase
      .from("v_historico_completo")
      .select("exercicio, peso_kg, repeticoes, serie_numero, grupo_muscular")
      .eq("data_treino", dataStr);

    setTreinoFeito(historico || []);

    // Se não treinou ainda, buscar treino do dia
    if (!historico || historico.length === 0) {
      const { data: workout } = await supabase
        .from("v_treino_dia")
        .select("*")
        .eq("user_id", userData.id)
        .eq("dia_semana", diaSemana)
        .order("ordem");

      setWorkoutToday(workout || []);
    } else {
      setWorkoutToday([]);
    }

    setLoading(false);
  }

  const deletarTreino = async () => {
    if (
      !confirm(
        "Tem certeza que deseja apagar este treino? Isso também desmarcará o hábito deste dia."
      )
    )
      return;

    try {
      const dataStr = selectedDate!.toISOString().split("T")[0];

      const response = await fetch("/api/workout/delete-workout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data_treino: dataStr }),
      });

      if (response.ok) {
        toast.success("Treino apagado! 🗑️");
        loadWorkout();
      } else {
        toast.error("Erro ao apagar treino");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao apagar treino");
    }
  };

  if (!selectedDate) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
      </div>
    );
  }

  // Se não estiver logado
  if (!loading && !user) {
    return (
      <div className="px-5 py-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Dumbbell className="w-8 h-8 text-cyan-500" />
          <h1 className="text-3xl font-bold text-foreground">Treino</h1>
        </div>
        <div className="p-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Faça login para acessar seus treinos
          </p>
          <Link
            href="/login"
            className="inline-block px-6 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="px-5 py-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Dumbbell className="w-8 h-8 text-cyan-500" />
            <h1 className="text-3xl font-bold text-foreground">Treino</h1>
          </div>
          {user && (
            <Link
              href="/workout/manage"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors"
            >
              <Settings className="w-5 h-5" />
              Gerenciar
            </Link>
          )}
        </div>

        {/* Calendário */}
        <DaysCarousel
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {/* Conteúdo */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500" />
          </div>
        ) : treinoFeito.length > 0 ? (
          // Treino já realizado
          <div className="space-y-4">
            <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Treino {isToday ? "já" : ""} realizado! ✅
              </h2>
              <p className="text-muted-foreground mb-4">
                {isToday
                  ? "Você já registrou seu treino hoje. Descanse e volte amanhã! 💪"
                  : `Treino realizado em ${selectedDate.toLocaleDateString(
                      "pt-BR"
                    )}`}
              </p>
              <div className="flex gap-4 justify-center text-sm mb-4">
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 font-semibold">
                  {[...new Set(treinoFeito.map((t) => t.exercicio))].length}{" "}
                  exercícios
                </span>
                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 font-semibold">
                  {treinoFeito.length} séries
                </span>
              </div>

              {/* Botão para apagar treino */}
              <button
                onClick={deletarTreino}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white font-semibold transition-all text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Apagar este treino
              </button>
            </div>

            {/* Resumo do treino */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <h3 className="font-bold text-lg mb-4 text-foreground">
                Resumo do treino
              </h3>
              <div className="space-y-3">
                {[...new Set(treinoFeito.map((t) => t.exercicio))].map(
                  (exercicio) => {
                    const series = treinoFeito.filter(
                      (t) => t.exercicio === exercicio
                    );
                    return (
                      <div
                        key={exercicio}
                        className="border-b border-border pb-3 last:border-0"
                      >
                        <p className="font-semibold text-foreground mb-1">
                          {exercicio}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {series.map((serie, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                            >
                              {serie.peso_kg}kg × {serie.repeticoes}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        ) : workoutToday.length > 0 ? (
          // Treino do dia
          <div>
            <h2 className="capitalize font-bold text-2xl text-cyan-600 mb-6">
              Treino de {DIA_SEMANA_MAP[selectedDate.getDay()]} 🔥
            </h2>
            <WorkoutSession
              exercises={workoutToday}
              selectedDate={selectedDate}
            />
          </div>
        ) : (
          // Dia de descanso
          <div className="p-6 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20">
            <p className="text-muted-foreground text-center text-lg">
              {isToday
                ? "Hoje é dia de descanso! 💤"
                : "Sem treino neste dia 💤"}
            </p>
          </div>
        )}

        {/* Link para stats */}
        <Link
          href="/workout/stats"
          className="inline-block text-sm text-cyan-600 hover:underline"
        >
          Ver estatísticas de treino 📊
        </Link>
      </div>
    </div>
  );
}
