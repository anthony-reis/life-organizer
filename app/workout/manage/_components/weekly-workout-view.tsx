// app/workout/manage/_components/weekly-workout-view.tsx
"use client";

import { useState } from "react";
import { Trash2, GripVertical, Edit2, Calendar } from "lucide-react";
import { removerExercicioDoTreino, editarExercicioTreino } from "../../actions";
import { toast } from "react-toastify";

type TreinoExercicio = {
  id: number;
  dia_semana: string;
  ordem: number;
  series_planejadas: number;
  repeticoes_planejadas: string;
  exercicios: {
    nome: string;
    grupos_musculares: { nome: string } | null;
  };
};

const DIAS_SEMANA = [
  { value: "segunda", label: "Segunda-feira", emoji: "💪" },
  { value: "terca", label: "Terça-feira", emoji: "🔥" },
  { value: "quarta", label: "Quarta-feira", emoji: "⚡" },
  { value: "quinta", label: "Quinta-feira", emoji: "💯" },
  { value: "sexta", label: "Sexta-feira", emoji: "🚀" },
  { value: "sabado", label: "Sábado", emoji: "🎯" },
  { value: "domingo", label: "Domingo", emoji: "🌟" },
];

export default function WeeklyWorkoutView({
  treinoSemanal,
}: {
  treinoSemanal: TreinoExercicio[];
}) {
  const [editando, setEditando] = useState<number | null>(null);
  const [series, setSeries] = useState("");
  const [repeticoes, setRepeticoes] = useState("");

  const agrupadoPorDia = DIAS_SEMANA.map((dia) => ({
    ...dia,
    exercicios: treinoSemanal
      .filter((t) => t.dia_semana === dia.value)
      .sort((a, b) => a.ordem - b.ordem),
  }));

  const handleRemover = async (id: number, nome: string) => {
    if (!confirm(`Remover "${nome}" do treino?`)) return;

    const result = await removerExercicioDoTreino(id);

    if (result.success) {
      toast.success("Exercício removido!");
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao remover");
    }
  };

  const handleEditar = (exercicio: TreinoExercicio) => {
    setEditando(exercicio.id);
    setSeries(exercicio.series_planejadas.toString());
    setRepeticoes(exercicio.repeticoes_planejadas);
  };

  const handleSalvarEdicao = async (id: number) => {
    const result = await editarExercicioTreino(
      id,
      parseInt(series),
      repeticoes
    );

    if (result.success) {
      toast.success("Exercício atualizado!");
      setEditando(null);
      window.location.reload();
    } else {
      toast.error(result.error || "Erro ao atualizar");
    }
  };

  return (
    <div className="space-y-4">
      {agrupadoPorDia.map((dia) => (
        <div
          key={dia.value}
          className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        >
          {/* Header do dia */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/10">
                <Calendar className="w-5 h-5 text-cyan-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                  {dia.label} {dia.emoji}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {dia.exercicios.length} exercício(s)
                </p>
              </div>
            </div>
          </div>

          {/* Lista de exercícios */}
          {dia.exercicios.length === 0 ? (
            <div className="p-6 rounded-lg bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum exercício programado
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {dia.exercicios.map((exercicio, index) => (
                <div
                  key={exercicio.id}
                  className="group flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 border border-transparent hover:border-cyan-500/30 transition-all"
                >
                  {/* Drag Handle */}
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
                    <span className="text-sm font-bold text-gray-400 min-w-[24px]">
                      {index + 1}.
                    </span>
                  </div>

                  {/* Info do exercício */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">
                      {exercicio.exercicios.nome}
                    </p>
                    {exercicio.exercicios.grupos_musculares && (
                      <p className="text-xs text-cyan-600 font-medium">
                        {exercicio.exercicios.grupos_musculares.nome}
                      </p>
                    )}
                  </div>

                  {/* Séries e Reps */}
                  {editando === exercicio.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={series}
                        onChange={(e) => setSeries(e.target.value)}
                        className="w-16 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                        placeholder="Séries"
                      />
                      <span className="text-gray-500">×</span>
                      <input
                        type="text"
                        value={repeticoes}
                        onChange={(e) => setRepeticoes(e.target.value)}
                        className="w-20 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                        placeholder="Reps"
                      />
                      <button
                        onClick={() => handleSalvarEdicao(exercicio.id)}
                        className="px-3 py-1 rounded bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
                      >
                        Salvar
                      </button>
                      <button
                        onClick={() => setEditando(null)}
                        className="px-3 py-1 rounded bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-sm font-semibold">
                        {exercicio.series_planejadas} ×{" "}
                        {exercicio.repeticoes_planejadas}
                      </span>

                      {/* Botões de ação */}
                      <button
                        onClick={() => handleEditar(exercicio)}
                        className="p-2 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          handleRemover(exercicio.id, exercicio.exercicios.nome)
                        }
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Resumo total */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-cyan-600">
              {treinoSemanal.length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total de Exercícios
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-600">
              {agrupadoPorDia.filter((d) => d.exercicios.length > 0).length}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Dias de Treino
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-cyan-600">
              {
                new Set(
                  treinoSemanal
                    .map((t) => t.exercicios.grupos_musculares?.nome)
                    .filter(Boolean)
                ).size
              }
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Grupos Musculares
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
