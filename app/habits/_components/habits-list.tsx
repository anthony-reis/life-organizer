"use client";

import { useState } from "react";
import {
  Check,
  X,
  Pencil,
  Trash2,
  BookOpen,
  ExternalLink,
  Dumbbell,
} from "lucide-react";
import { marcarHabito, deletarHabito } from "../actions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import EditHabitModal from "./edit-habit-modal";
import Link from "next/link";

type Habito = {
  id: number;
  nome: string;
  descricao: string | null;
  periodicidade: string;
  xp_ganho: number;
  tracking_id: number | null;
  concluido: boolean | null;
  xp_ganho_hoje: number | null;
  xp_perdido: number | null;
  dias_semana: number[] | null;
  dia_mes: number | null;
};

type LivroSemana = {
  semana: number;
  livro_titulo: string;
  concluido: boolean;
} | null;

export default function HabitsList({
  habitos,
  livroSemana,
  diasTreino,
  treinoHoje,
}: {
  habitos: Habito[];
  livroSemana: LivroSemana;
  diasTreino: number[];
  treinoHoje: string | null;
}) {
  const [loading, setLoading] = useState<number | null>(null);
  const [editando, setEditando] = useState<Habito | null>(null);
  const router = useRouter();

  if (!habitos || !Array.isArray(habitos)) {
    return (
      <div className="p-12 text-center rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">
          Carregando hábitos...
        </p>
      </div>
    );
  }

  const handleMarcar = async (habitoId: number, concluido: boolean) => {
    setLoading(habitoId);

    const result = await marcarHabito(habitoId, !concluido);

    if (result.success) {
      toast.success(!concluido ? `+${result.xp} XP! 🎉` : "Hábito desmarcado");
      router.refresh();
    } else {
      toast.error("Erro ao atualizar hábito");
    }

    setLoading(null);
  };

  const handleDeletar = async (habitoId: number) => {
    if (!confirm("Tem certeza que deseja deletar este hábito?")) return;

    const result = await deletarHabito(habitoId);

    if (result.success) {
      toast.success("Hábito deletado!");
      router.refresh();
    } else {
      toast.error("Erro ao deletar hábito");
    }
  };

  const periodicidadeLabel = {
    DIARIO: "Todos os dias",
    SEMANAL: "1x por semana",
    TRES_SEMANA: "3x por semana",
    CINCO_SEMANA: "5x por semana",
    QUINZENAL: "A cada 15 dias",
    MENSAL: "1x por mês",
  };

  const diasSemanaLabel: Record<number, string> = {
    0: "Dom",
    1: "Seg",
    2: "Ter",
    3: "Qua",
    4: "Qui",
    5: "Sex",
    6: "Sáb",
  };

  // Verificar se existe hábito de leitura
  const habitoLeitura = habitos.find(
    (h) =>
      h.nome.toLowerCase().includes("ler") ||
      h.nome.toLowerCase().includes("leitura")
  );

  // Verificar se existe hábito de treino
  const habitoTreino = habitos.find(
    (h) =>
      h.nome.toLowerCase().includes("treino") ||
      h.nome.toLowerCase().includes("academia") ||
      h.nome.toLowerCase().includes("treinar")
  );

  if (habitos.length === 0) {
    return (
      <div className="p-12 text-center rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Nenhum hábito para hoje!
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Crie seu primeiro hábito e comece a ganhar XP 🎯
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {habitos.map((habito) => {
          const isConcluido = habito.concluido;
          const isCarregando = loading === habito.id;
          const isHabitoLeitura = habito.id === habitoLeitura?.id;
          const isHabitoTreino = habito.id === habitoTreino?.id;

          return (
            <div
              key={habito.id}
              className={`rounded-lg border transition-all ${
                isConcluido
                  ? "border-green-500/30 bg-green-500/5"
                  : isHabitoLeitura && livroSemana
                  ? "border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-cyan-600/5"
                  : isHabitoTreino
                  ? "border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5"
                  : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              }`}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Checkbox */}
                <button
                  onClick={() => handleMarcar(habito.id, isConcluido || false)}
                  disabled={isCarregando}
                  className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                    isConcluido
                      ? "bg-green-500 border-green-500"
                      : "border-gray-300 dark:border-gray-600 hover:border-purple-500"
                  } ${
                    isCarregando
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                  }`}
                >
                  {isConcluido && <Check className="w-6 h-6 text-white" />}
                </button>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-semibold text-lg ${
                        isConcluido
                          ? "text-gray-500 dark:text-gray-500 line-through"
                          : "text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {habito.nome}
                    </h3>
                    {isHabitoLeitura && livroSemana && (
                      <BookOpen className="w-5 h-5 text-cyan-500" />
                    )}
                    {isHabitoTreino && (
                      <Dumbbell className="w-5 h-5 text-orange-500" />
                    )}
                  </div>

                  {habito.descricao && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {habito.descricao}
                    </p>
                  )}

                  {/* Mostrar livro da semana se for hábito de leitura */}
                  {isHabitoLeitura && livroSemana && (
                    <div className="mt-2 p-3 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 uppercase mb-1">
                            📚 Livro da Semana {livroSemana.semana}
                          </p>
                          <p className="text-sm font-semibold text-cyan-800 dark:text-cyan-300">
                            {livroSemana.livro_titulo}
                          </p>
                        </div>
                        <Link
                          href="/reading"
                          className="p-2 rounded-lg text-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Mostrar dias de treino se for hábito de treino */}
                  {isHabitoTreino && diasTreino.length > 0 && (
                    <div className="mt-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {treinoHoje && (
                            <p className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-2">
                              🎯 Hoje: {treinoHoje}
                            </p>
                          )}
                        </div>
                        <Link
                          href="/workout"
                          className="p-2 rounded-lg text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-700 dark:text-purple-400 font-semibold">
                      {
                        periodicidadeLabel[
                          habito.periodicidade as keyof typeof periodicidadeLabel
                        ]
                      }
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-semibold">
                      +{habito.xp_ganho} XP
                    </span>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditando(habito)}
                    className="p-2 rounded-lg text-gray-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeletar(habito.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Mostrar XP perdido */}
              {habito.xp_perdido && habito.xp_perdido > 0 && !isConcluido && (
                <div className="px-4 pb-4">
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Você perdeu {habito.xp_perdido} XP por não concluir ontem
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editando && (
        <EditHabitModal habito={editando} onClose={() => setEditando(null)} />
      )}
    </>
  );
}
