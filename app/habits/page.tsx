// app/habits/page.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import HabitsHeader from "./_components/habits-header";
import HabitsList from "./_components/habits-list";
import CreateHabitButton from "./_components/create-habit-button";
import DaysCarousel from "./_components/days-carousel";
import { Target } from "lucide-react";

const DIA_SEMANA_MAP: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  terca: 2,
  quarta: 3,
  quinta: 4,
  sexta: 5,
  sabado: 6,
};

export default function HabitsPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [habitos, setHabitos] = useState<any[]>([]);
  const [xpData, setXpData] = useState<any>(null);
  const [livroSemana, setLivroSemana] = useState<any>(null);
  const [diasTreino, setDiasTreino] = useState<number[]>([]);
  const [treinoHoje, setTreinoHoje] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializar data no useEffect para evitar warning
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(new Date());
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      loadHabitos();
    }
  }, [selectedDate]);

  async function loadHabitos() {
    if (!selectedDate) return;

    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // Buscar XP
    let { data: xpDataResult } = await supabase
      .from("usuario_xp")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!xpDataResult) {
      const { data: newXp } = await supabase
        .from("usuario_xp")
        .insert({ user_id: user.id, xp_total: 0, level: 1 })
        .select()
        .single();
      xpDataResult = newXp;
    }
    setXpData(xpDataResult);

    // Buscar treinos
    const { data: treinoDias } = await supabase
      .from("v_treino_dia")
      .select("dia_semana, grupo_muscular")
      .eq("user_id", user.id);

    const diasTreinoArray = [
      ...new Set(
        treinoDias?.map((d) => DIA_SEMANA_MAP[d.dia_semana.toLowerCase()]) || []
      ),
    ];
    setDiasTreino(diasTreinoArray);

    const diaSemanaSelected = selectedDate.getDay();
    const diasSemanaInverso: Record<number, string> = {
      0: "domingo",
      1: "segunda",
      2: "terca",
      3: "quarta",
      4: "quinta",
      5: "sexta",
      6: "sabado",
    };

    const treino = treinoDias?.find(
      (t) => t.dia_semana.toLowerCase() === diasSemanaInverso[diaSemanaSelected]
    );
    setTreinoHoje(treino?.grupo_muscular || null);

    // Buscar livro da semana
    const semana = Math.ceil(
      (selectedDate.getTime() -
        new Date(selectedDate.getFullYear(), 0, 1).getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    );

    const { data: livro } = await supabase
      .from("plano_leitura")
      .select("*")
      .eq("user_id", user.id)
      .eq("ano", selectedDate.getFullYear())
      .eq("semana", semana)
      .single();
    setLivroSemana(livro);

    // Buscar hábitos
    const { data: todosHabitos } = await supabase
      .from("habitos")
      .select("*")
      .eq("user_id", user.id)
      .eq("ativo", true);

    const dataStr = selectedDate.toISOString().split("T")[0];
    const { data: tracking } = await supabase
      .from("habitos_tracking")
      .select("*")
      .eq("user_id", user.id)
      .eq("data", dataStr);

    const habitosComTracking =
      todosHabitos?.map((h) => {
        const t = tracking?.find((tr) => tr.habito_id === h.id);
        return {
          ...h,
          tracking_id: t?.id || null,
          concluido: t?.concluido || false,
          xp_ganho_hoje: t?.xp_ganho || null,
          xp_perdido: t?.xp_perdido || null,
        };
      }) || [];

    const habitosDia = habitosComTracking.filter((h) => {
      if (h.periodicidade === "DIARIO") return true;
      if (
        ["SEMANAL", "TRES_SEMANA", "CINCO_SEMANA"].includes(h.periodicidade)
      ) {
        return h.dias_semana?.includes(diaSemanaSelected);
      }
      if (h.periodicidade === "MENSAL") {
        return selectedDate.getDate() === h.dia_mes;
      }
      if (h.periodicidade === "QUINZENAL") {
        const dataInicio = new Date(h.data_inicio);
        const diff = Math.floor(
          (selectedDate.getTime() - dataInicio.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return diff % 15 === 0;
      }
      return false;
    });

    setHabitos(habitosDia);
    setLoading(false);
  }

  if (!selectedDate) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="px-5 py-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Target className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Hábitos</h1>
        </div>

        {xpData && <HabitsHeader xp={xpData} />}

        <DaysCarousel
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <CreateHabitButton />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <HabitsList
            habitos={habitos}
            livroSemana={livroSemana}
            diasTreino={diasTreino}
            treinoHoje={treinoHoje}
          />
        )}
      </div>
    </div>
  );
}
