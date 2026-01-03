"use client";

import { useState } from "react";
import { X, Plus, Dumbbell } from "lucide-react";
import { criarExercicio } from "../../actions";
import { toast } from "react-toastify";

type GrupoMuscular = {
  id: number;
  nome: string;
};

export default function CreateExerciseModal({
  grupos,
  onClose,
  onSuccess,
}: {
  grupos: GrupoMuscular[];
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState("");
  const [grupoMuscularId, setGrupoMuscularId] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("grupo_muscular_id", grupoMuscularId);
    formData.append("observacoes", observacoes);

    const result = await criarExercicio(formData);

    if (result.success) {
      toast.success("Exercício criado com sucesso! 💪");
      onSuccess?.();
      onClose();
    } else {
      toast.error(result.error || "Erro ao criar exercício");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Dumbbell className="w-6 h-6 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Novo Exercício
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Nome do Exercício
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Supino Reto"
              required
              maxLength={100}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Grupo Muscular
            </label>
            <select
              value={grupoMuscularId}
              onChange={(e) => setGrupoMuscularId(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            >
              <option value="">Selecione...</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Observações (opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Ex: Usar pegada larga"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
            />
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
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                "Criando..."
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Criar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
