"use client";

import { useState } from "react";
import { Plus, Calendar, Dumbbell } from "lucide-react";
import CreateExerciseModal from "./create-exercise-modal";
import AddToWorkoutModal from "./add-to-workout-modal";
import WeeklyWorkoutView from "./weekly-workout-view";

type Exercicio = {
  id: number;
  nome: string;
  grupos_musculares: { nome: string } | null;
  observacoes: string | null;
};

type GrupoMuscular = {
  id: number;
  nome: string;
};

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

export default function WorkoutManager({
  exercicios,
  grupos,
  treinoSemanal,
}: {
  exercicios: Exercicio[];
  grupos: GrupoMuscular[];
  treinoSemanal: TreinoExercicio[];
}) {
  const [view, setView] = useState<"exercises" | "schedule">("schedule");
  const [criarExercicioModal, setCriarExercicioModal] = useState(false);
  const [adicionarTreinoModal, setAdicionarTreinoModal] =
    useState<Exercicio | null>(null);
  const [filtroGrupo, setFiltroGrupo] = useState<string>("");

  const exerciciosFiltrados = filtroGrupo
    ? exercicios.filter((ex) => ex.grupos_musculares?.nome === filtroGrupo)
    : exercicios;

  const handleAdicionarAoTreino = (exercicio: Exercicio) => {
    console.log("Abrindo modal para exercício:", exercicio);
    setAdicionarTreinoModal(exercicio);
  };

  const handleFecharModal = () => {
    console.log("Fechando modal");
    setAdicionarTreinoModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Toggle View */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          onClick={() => setView("schedule")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            view === "schedule"
              ? "bg-white dark:bg-gray-700 text-cyan-600 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-cyan-600"
          }`}
        >
          <Calendar className="w-5 h-5" />
          Treino Semanal
        </button>
        <button
          onClick={() => setView("exercises")}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
            view === "exercises"
              ? "bg-white dark:bg-gray-700 text-cyan-600 shadow-md"
              : "text-gray-600 dark:text-gray-400 hover:text-cyan-600"
          }`}
        >
          <Dumbbell className="w-5 h-5" />
          Meus Exercícios
        </button>
      </div>

      {/* Content */}
      {view === "schedule" ? (
        <WeeklyWorkoutView treinoSemanal={treinoSemanal} />
      ) : (
        <>
          {/* Filtros e Ações */}
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <select
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              <option value="">Todos os grupos</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.nome}>
                  {grupo.nome}
                </option>
              ))}
            </select>

            <button
              onClick={() => setCriarExercicioModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 text-white font-semibold hover:bg-cyan-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Novo Exercício
            </button>
          </div>

          {/* Lista de Exercícios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exerciciosFiltrados.length === 0 ? (
              <div className="col-span-full p-8 rounded-xl bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  {filtroGrupo
                    ? "Nenhum exercício encontrado para este grupo"
                    : "Nenhum exercício cadastrado. Crie seu primeiro exercício!"}
                </p>
              </div>
            ) : (
              exerciciosFiltrados.map((exercicio) => (
                <div
                  key={exercicio.id}
                  className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-cyan-500 transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">
                      {exercicio.nome}
                    </h3>
                  </div>
                  {exercicio.grupos_musculares && (
                    <p className="text-sm text-cyan-600 font-semibold mb-3">
                      {exercicio.grupos_musculares.nome}
                    </p>
                  )}
                  {exercicio.observacoes && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {exercicio.observacoes}
                    </p>
                  )}
                  <button
                    onClick={() => handleAdicionarAoTreino(exercicio)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/10 text-cyan-600 font-semibold hover:bg-cyan-500 hover:text-white transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar ao Treino
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {criarExercicioModal && (
        <CreateExerciseModal
          grupos={grupos}
          onClose={() => setCriarExercicioModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}

      {adicionarTreinoModal && (
        <AddToWorkoutModal
          exercicio={adicionarTreinoModal}
          onClose={handleFecharModal}
        />
      )}
    </div>
  );
}
