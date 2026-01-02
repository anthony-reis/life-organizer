// app/reading/_components/reading-weeks.tsx
"use client";

import { useState } from "react";
import { Check, Book, MessageSquare, Edit2, Save, X } from "lucide-react";
import { marcarSemana, salvarAnotacao } from "../actions";
import { toast } from "react-toastify";

type PlanoItem = {
  id: number;
  semana: number;
  livro_titulo: string;
  concluido: boolean;
  observacoes: string | null;
};

export default function ReadingWeeks({ plano }: { plano: PlanoItem[] }) {
  const [semanasMarcadas, setSemanasMarcadas] = useState<Set<number>>(
    new Set(plano.filter((p) => p.concluido).map((p) => p.semana))
  );
  const [loading, setLoading] = useState<number | null>(null);
  const [editandoNota, setEditandoNota] = useState<number | null>(null);
  const [notas, setNotas] = useState<Record<number, string>>(
    Object.fromEntries(plano.map((p) => [p.id, p.observacoes || ""]))
  );
  const [notaTemp, setNotaTemp] = useState("");

  const handleToggle = async (
    semana: number,
    planoId: number,
    concluido: boolean
  ) => {
    setLoading(semana);

    const novoStatus = !concluido;
    const result = await marcarSemana(planoId, novoStatus);

    if (result.success) {
      setSemanasMarcadas((prev) => {
        const newSet = new Set(prev);
        if (novoStatus) {
          newSet.add(semana);
          toast.success(`Semana ${semana} marcada como concluída! 🎉`);
        } else {
          newSet.delete(semana);
          toast.info(`Semana ${semana} desmarcada`);
        }
        return newSet;
      });
    } else {
      toast.error("Erro ao atualizar");
    }

    setLoading(null);
  };

  const abrirEdicaoNota = (planoId: number) => {
    setEditandoNota(planoId);
    setNotaTemp(notas[planoId] || "");
  };

  const salvarNota = async (planoId: number) => {
    const result = await salvarAnotacao(planoId, notaTemp);

    if (result.success) {
      setNotas((prev) => ({ ...prev, [planoId]: notaTemp }));
      setEditandoNota(null);
      toast.success("Anotação salva! 📝");
    } else {
      toast.error("Erro ao salvar anotação");
    }
  };

  const cancelarEdicao = () => {
    setEditandoNota(null);
    setNotaTemp("");
  };

  // Semana atual do ano
  const semanaAtual = Math.ceil(
    (new Date().getTime() -
      new Date(new Date().getFullYear(), 0, 1).getTime()) /
      (7 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
        <Book className="w-6 h-6 text-cyan-500" />
        Leitura Semanal
      </h2>

      <div className="space-y-3">
        {plano.map((item) => {
          const isConcluido = semanasMarcadas.has(item.semana);
          const isSemanaAtual = item.semana === semanaAtual;
          const isCarregando = loading === item.semana;
          const isEditandoNota = editandoNota === item.id;
          const temNota = notas[item.id] && notas[item.id].trim().length > 0;

          return (
            <div
              key={item.id}
              className={`rounded-lg border transition-all ${
                isSemanaAtual
                  ? "border-cyan-500 bg-cyan-500/5 ring-2 ring-cyan-500/20"
                  : isConcluido
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              {/* Linha Principal */}
              <div className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <button
                  onClick={() =>
                    handleToggle(item.semana, item.id, isConcluido)
                  }
                  disabled={isCarregando}
                  className={`flex-shrink-0 w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isConcluido
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 dark:border-gray-600 hover:border-cyan-500"
                  } ${
                    isCarregando
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {isConcluido && <Check className="w-5 h-5 text-white" />}
                </button>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded ${
                        isSemanaAtual
                          ? "bg-cyan-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      Sem {item.semana}
                    </span>
                    {isSemanaAtual && (
                      <span className="text-xs font-semibold text-cyan-600 uppercase">
                        Atual
                      </span>
                    )}
                  </div>
                  <p
                    className={`font-medium ${
                      isConcluido
                        ? "text-gray-500 dark:text-gray-500 line-through"
                        : "text-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {item.livro_titulo}
                  </p>
                </div>

                {/* Botão de Anotação */}
                <button
                  onClick={() => abrirEdicaoNota(item.id)}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    temNota
                      ? "bg-cyan-500/20 text-cyan-600 hover:bg-cyan-500/30"
                      : "text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10"
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>

              {/* Seção de Anotação */}
              {(isEditandoNota || temNota) && !isEditandoNota && (
                <div className="px-4 pb-4 pt-0">
                  <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        Anotações
                      </span>
                      <button
                        onClick={() => abrirEdicaoNota(item.id)}
                        className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {notas[item.id]}
                    </p>
                  </div>
                </div>
              )}

              {/* Editor de Anotação */}
              {isEditandoNota && (
                <div className="px-4 pb-4 pt-0">
                  <div className="p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border-2 border-cyan-500/30">
                    <label className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase mb-2 block">
                      ✍️ Suas anotações
                    </label>
                    <textarea
                      value={notaTemp}
                      onChange={(e) => setNotaTemp(e.target.value)}
                      placeholder="Ex: Achei o capítulo 5 incrível! O personagem principal..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 text-sm resize-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => salvarNota(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        Salvar
                      </button>
                      <button
                        onClick={cancelarEdicao}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
