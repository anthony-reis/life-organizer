"use client";

import { useState } from "react";
import { X, Plus, BookPlus, AlertCircle } from "lucide-react";
import { adicionarLivro } from "../actions";
import { toast } from "react-toastify";

export default function AddBookModal({
  semanasOcupadas,
  onClose,
}: {
  semanasOcupadas: number[];
  onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [livroTitulo, setLivroTitulo] = useState("");
  const [semana, setSemana] = useState("");
  const anoAtual = new Date().getFullYear();

  const semanasDisponiveis = Array.from({ length: 52 }, (_, i) => i + 1).filter(
    (s) => !semanasOcupadas.includes(s)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const semanaNum = parseInt(semana);

    // Validações
    if (!livroTitulo.trim()) {
      toast.error("Digite o título do livro");
      return;
    }

    if (semanaNum < 1 || semanaNum > 52) {
      toast.error("Semana deve ser entre 1 e 52");
      return;
    }

    if (semanasOcupadas.includes(semanaNum)) {
      toast.error(`Já existe um livro cadastrado para a semana ${semanaNum}`);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("livro_titulo", livroTitulo.trim());
    formData.append("semana", semana);
    formData.append("ano", anoAtual.toString());

    const result = await adicionarLivro(formData);

    if (result.success) {
      toast.success("Livro adicionado com sucesso! 📚");
      onClose();
    } else {
      toast.error(result.error || "Erro ao adicionar livro");
    }

    setLoading(false);
  };

  const semanaAtual = Math.ceil(
    (new Date().getTime() -
      new Date(new Date().getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <BookPlus className="w-6 h-6 text-cyan-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Adicionar Livro
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
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
              maxLength={200}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Selecione a Semana
            </label>
            {/* Grid de semanas disponíveis */}
            <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase mb-3">
                Clique em uma semana disponível:
              </p>
              <div className="grid grid-cols-10 gap-2">
                {Array.from({ length: 52 }, (_, i) => i + 1).map((s) => {
                  const ocupada = semanasOcupadas.includes(s);
                  const selecionada = parseInt(semana) === s;
                  const atual = s === semanaAtual;

                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => !ocupada && setSemana(s.toString())}
                      disabled={ocupada}
                      className={`
                        relative aspect-square rounded-lg font-semibold text-sm transition-all
                        ${
                          selecionada
                            ? "bg-cyan-500 text-white ring-2 ring-cyan-500 ring-offset-2 dark:ring-offset-gray-700 scale-110"
                            : ocupada
                            ? "bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through"
                            : atual
                            ? "bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-2 border-cyan-500 hover:bg-cyan-200 dark:hover:bg-cyan-900/50"
                            : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:border-cyan-500"
                        }
                      `}
                      title={
                        ocupada
                          ? `Semana ${s} já possui um livro`
                          : atual
                          ? `Semana ${s} (Atual)`
                          : `Semana ${s}`
                      }
                    >
                      {s}
                      {atual && !ocupada && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Info sobre disponibilidade */}
            <div className="mt-3 flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                  {semanasDisponiveis.length} semanas disponíveis
                </span>{" "}
                de 52 no total. Semanas riscadas já possuem livros cadastrados.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
            <p className="text-sm text-cyan-800 dark:text-cyan-200">
              📅 Ano: <span className="font-bold">{anoAtual}</span>
              {semana && (
                <>
                  {" "}
                  • 📖 Semana: <span className="font-bold">{semana}</span>
                </>
              )}
            </p>
          </div>

          {/* Buttons */}
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
              disabled={loading || !semana || !livroTitulo.trim()}
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
