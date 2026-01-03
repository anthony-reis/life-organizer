"use client";

import { useState } from "react";
import { X, Plus, Calendar } from "lucide-react";
import { adicionarExercicioAoTreino } from "../../actions";
import { toast } from "react-toastify";

type Exercicio = {
  id: number;
  nome: string;
  grupos_musculares: { nome: string } | null;
  observacoes: string | null;
};

const DIAS_SEMANA = [
  { value: "segunda", label: "Segunda-feira" },
  { value: "terca", label: "Terça-feira" },
  { value: "quarta", label: "Quarta-feira" },
  { value: "quinta", label: "Quinta-feira" },
  { value: "sexta", label: "Sexta-feira" },
  { value: "sabado", label: "Sábado" },
  { value: "domingo", label: "Domingo" },
];

export default function AddToWorkoutModal({
  exercicio,
  onClose,
}: {
  exercicio: Exercicio | null;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [diaSemana, setDiaSemana] = useState("");
  const [series, setSeries] = useState("3");
  const [repeticoes, setRepeticoes] = useState("8-12");

  // Verificação de segurança
  if (!exercicio) {
    console.error("Exercício não foi passado para o modal");
    return null;
  }

  console.log("Exercício recebido:", exercicio);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exercicio) {
      toast.error("Erro: exercício não encontrado");
      return;
    }

    setLoading(true);

    const result = await adicionarExercicioAoTreino(
      exercicio.id,
      diaSemana,
      parseInt(series),
      repeticoes
    );

    if (result.success) {
      toast.success(`${exercicio.nome} adicionado ao treino! 💪`);
      onClose();
      // Recarregar após fechar
      setTimeout(() => window.location.reload(), 500);
    } else {
      toast.error(result.error || "Erro ao adicionar ao treino");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Calendar className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Adicionar ao Treino
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {exercicio.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {exercicio.grupos_musculares && (
            <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
              <p className="text-sm text-cyan-800 dark:text-cyan-200">
                💪{" "}
                <span className="font-bold">
                  {exercicio.grupos_musculares.nome}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Dia da Semana
            </label>
            <select
              value={diaSemana}
              onChange={(e) => setDiaSemana(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            >
              <option value="">Selecione o dia...</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Séries
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Repetições
              </label>
              <input
                type="text"
                value={repeticoes}
                onChange={(e) => setRepeticoes(e.target.value)}
                placeholder="8-12"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !diaSemana}
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                "Adicionando..."
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Adicionar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
