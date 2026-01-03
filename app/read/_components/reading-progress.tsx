"use client";

import { Award, Trophy } from "lucide-react";

type Recompensa = {
  id: number;
  semanas_necessarias: number;
  titulo: string;
  descricao: string;
  desbloqueada: boolean;
};

export default function ReadingProgress({
  semanasCompletas,
  totalSemanas,
  recompensas,
}: {
  semanasCompletas: number;
  totalSemanas: number;
  recompensas: Recompensa[];
}) {
  const percentual = ((semanasCompletas / totalSemanas) * 100).toFixed(1);

  // Próxima recompensa
  const proximaRecompensa = recompensas.find(
    (r) => r.semanas_necessarias > semanasCompletas
  );

  // Última recompensa desbloqueada
  const ultimaDesbloqueada = recompensas
    .filter((r) => r.semanas_necessarias <= semanasCompletas)
    .pop();

  return (
    <div className="space-y-4">
      {/* Card de Progresso Principal */}
      <div className="p-8 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 text-center">
        <div className="text-6xl font-bold text-cyan-600 mb-2">
          {semanasCompletas}
          <span className="text-2xl text-gray-600 dark:text-gray-400">
            /{totalSemanas}
          </span>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          semanas concluídas
        </p>

        {/* Barra de progresso */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-500"
            style={{ width: `${percentual}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {percentual}% do ano
        </p>
      </div>

      {/* Última Recompensa Desbloqueada */}
      {ultimaDesbloqueada && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-6 h-6 text-green-500" />
            <h3 className="font-bold text-lg text-green-600">
              {ultimaDesbloqueada.titulo}
            </h3>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {ultimaDesbloqueada.descricao}
          </p>
        </div>
      )}

      {/* Próxima Recompensa */}
      {proximaRecompensa && (
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Award className="w-6 h-6 text-purple-500" />
            <h3 className="font-bold text-lg text-purple-600">
              Próxima Recompensa
            </h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Faltam{" "}
            <span className="font-bold text-purple-600">
              {proximaRecompensa.semanas_necessarias - semanasCompletas}
            </span>{" "}
            semanas
          </p>
          <p className="text-gray-700 dark:text-gray-300 font-semibold">
            {proximaRecompensa.titulo}
          </p>
        </div>
      )}
    </div>
  );
}
