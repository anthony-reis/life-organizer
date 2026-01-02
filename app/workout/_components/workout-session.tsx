"use client";

import { useState } from "react";
import { CheckCircle2, Dumbbell, Plus, Save } from "lucide-react";
import { toast } from "react-toastify";

type Exercise = {
  treino_exercicio_id: number;
  exercicio: string;
  grupo_muscular: string;
  series_planejadas: number;
  repeticoes_planejadas: string;
};

type Serie = {
  serie_numero: number;
  peso_kg: number;
  repeticoes: number;
};

export default function WorkoutSession({
  exercises,
}: {
  exercises: Exercise[];
}) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [series, setSeries] = useState<Serie[]>([]);
  const [pesoAtual, setPesoAtual] = useState("");
  const [repeticoesAtual, setRepeticoesAtual] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const exercise = exercises[currentExercise];
  const seriesFeitas = series.length;
  const seriesTotal = exercise.series_planejadas || 3;

  const adicionarSerie = () => {
    if (!pesoAtual || !repeticoesAtual) return;

    const novaSerie: Serie = {
      serie_numero: seriesFeitas + 1,
      peso_kg: parseFloat(pesoAtual),
      repeticoes: parseInt(repeticoesAtual),
    };

    setSeries([...series, novaSerie]);
    setPesoAtual("");
    setRepeticoesAtual("");
  };

  const salvarExercicio = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/workout/save-series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          treino_exercicio_id: exercise.treino_exercicio_id,
          series: series,
        }),
      });
      if (response.ok) {
        if (currentExercise < exercises.length - 1) {
          setCurrentExercise(currentExercise + 1);
          setSeries([]);
        } else {
          toast.success("Treino finalizado! 💪🔥");
          window.location.href = "/";
        }
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar séries");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progresso */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Progresso</p>
          <p className="text-lg font-bold text-cyan-600">
            {currentExercise + 1} / {exercises.length} exercícios
          </p>
        </div>
        <Dumbbell className="w-8 h-8 text-cyan-500" />
      </div>

      {/* Exercício atual */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {exercise.exercicio}
        </h2>
        <p className="text-cyan-600 font-semibold mb-4">
          {exercise.grupo_muscular}
        </p>

        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
          <span>Séries: {seriesTotal}</span>
          <span>•</span>
          <span>Reps: {exercise.repeticoes_planejadas || "8-12"}</span>
        </div>
      </div>

      {/* Séries realizadas */}
      {series.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300">
            Séries realizadas:
          </h3>
          {series.map((serie) => (
            <div
              key={serie.serie_numero}
              className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold">
                  Série {serie.serie_numero}
                </span>
              </div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {serie.peso_kg} kg × {serie.repeticoes} reps
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar série */}
      {seriesFeitas < seriesTotal && (
        <div className="p-6 rounded-xl border-2 border-dashed border-cyan-500/30">
          <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Série {seriesFeitas + 1}
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                step="0.5"
                value={pesoAtual}
                onChange={(e) => setPesoAtual(e.target.value)}
                placeholder="20"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repetições
              </label>
              <input
                type="number"
                value={repeticoesAtual}
                onChange={(e) => setRepeticoesAtual(e.target.value)}
                placeholder="12"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            onClick={adicionarSerie}
            disabled={!pesoAtual || !repeticoesAtual}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-5 h-5" />
            Adicionar Série
          </button>
        </div>
      )}

      {/* Salvar e próximo */}
      {seriesFeitas > 0 && (
        <button
          onClick={salvarExercicio}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-bold text-lg hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/50 transition-all"
        >
          <Save className="w-6 h-6" />
          {isLoading
            ? "Salvando..."
            : currentExercise < exercises.length - 1
            ? "Salvar e Próximo"
            : "Finalizar Treino"}
        </button>
      )}
    </div>
  );
}
