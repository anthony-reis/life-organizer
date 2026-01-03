"use client";

import { Trophy, Zap } from "lucide-react";

type XPData = {
  xp_total: number;
  level: number;
};

export default function HabitsHeader({ xp }: { xp: XPData | null }) {
  if (!xp) return null;

  const xpParaProximoLevel = xp.level * 100;
  const xpAtual = xp.xp_total % xpParaProximoLevel;
  const percentual = (xpAtual / xpParaProximoLevel) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card de Level */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
        <div className="flex items-center gap-3 mb-3">
          <Trophy className="w-6 h-6 text-purple-500" />
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            Level {xp.level}
          </h3>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
            style={{ width: `${percentual}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {xpAtual} / {xpParaProximoLevel} XP
        </p>
      </div>

      {/* Card de XP Total */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
        <div className="flex items-center gap-3 mb-3">
          <Zap className="w-6 h-6 text-cyan-500" />
          <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">
            XP Total
          </h3>
        </div>
        <p className="text-4xl font-bold text-cyan-600">{xp.xp_total}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Pontos de experiência
        </p>
      </div>
    </div>
  );
}
