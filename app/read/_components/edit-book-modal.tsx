"use client";

import { useState } from "react";
import { X, Save, Trash2, BookOpen } from "lucide-react";
import { editarLivro, deletarLivro } from "../actions";
import { toast } from "react-toastify";

type PlanoItem = {
  id: number;
  semana: number;
  livro_titulo: string;
  concluido: boolean;
  observacoes: string | null;
};

export default function EditBookModal({
  livro,
  onClose,
}: {
  livro: PlanoItem;
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [livroTitulo, setLivroTitulo] = useState(livro.livro_titulo);
  const [deletando, setDeletando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await editarLivro(livro.id, livroTitulo);

    if (result.success) {
      toast.success("Livro atualizado com sucesso! 📚");
      onClose();
    } else {
      toast.error(result.error || "Erro ao atualizar livro");
    }

    setLoading(false);
  };

  const handleDeletar = async () => {
    if (!confirm("Tem certeza que deseja deletar este livro?")) return;

    setDeletando(true);

    const result = await deletarLivro(livro.id);

    if (result.success) {
      toast.success("Livro deletado com sucesso!");
      onClose();
    } else {
      toast.error(result.error || "Erro ao deletar livro");
    }

    setDeletando(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <BookOpen className="w-6 h-6 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Editar Livro
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Semana {livro.semana}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Título do Livro
            </label>
            <input
              type="text"
              value={livroTitulo}
              onChange={(e) => setLivroTitulo(e.target.value)}
              placeholder="Ex: O Hobbit"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          {livro.concluido && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-400">
                ✅ Este livro já foi marcado como concluído
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDeletar}
              disabled={deletando || loading}
              className="px-4 py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deletando ? "Deletando..." : "Deletar"}
            </button>
            <button
              type="submit"
              disabled={loading || deletando}
              className="flex-1 px-4 py-3 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
