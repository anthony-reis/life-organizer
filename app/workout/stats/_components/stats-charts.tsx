// app/workouts/stats/_components/stats-charts.tsx
"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

type HistoricoItem = {
  data_treino: string;
  exercicio: string;
  grupo_muscular: string;
  peso_kg: number;
  repeticoes: number;
  serie_numero: number;
};

type EvolucaoItem = {
  exercicio: string;
  peso_inicial: number;
  peso_maximo: number;
  ultimo_peso: number;
  total_treinos: number;
};

const CORES_GRUPOS = {
  Peito: "#06b6d4",
  Ombro: "#8b5cf6",
  Tríceps: "#f59e0b",
  "Pernas - Quadríceps": "#10b981",
  "Pernas - Posterior": "#14b8a6",
  Glúteos: "#ec4899",
  Panturrilha: "#6366f1",
  Costas: "#3b82f6",
  Bíceps: "#ef4444",
};

export default function StatsCharts({
  historico,
  evolucaoGeral,
}: {
  historico: HistoricoItem[];
  evolucaoGeral: EvolucaoItem[];
}) {
  const exercicios = [...new Set(historico.map((h) => h.exercicio))];
  const [exercicioSelecionado, setExercicioSelecionado] = useState(
    exercicios[0]
  );

  // Preparar dados para evolução de peso por exercício
  const dadosExercicio = historico
    .filter((h) => h.exercicio === exercicioSelecionado)
    .reduce((acc: any[], curr) => {
      const dataExistente = acc.find((item) => item.data === curr.data_treino);
      if (dataExistente) {
        if (curr.peso_kg > dataExistente.peso_maximo) {
          dataExistente.peso_maximo = curr.peso_kg;
        }
        dataExistente.volume_total += curr.peso_kg * curr.repeticoes;
      } else {
        acc.push({
          data: curr.data_treino,
          peso_maximo: curr.peso_kg,
          volume_total: curr.peso_kg * curr.repeticoes,
        });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

  // Preparar dados para evolução de volume por grupo muscular ao longo do tempo
  const dadosEvolucaoPorGrupo = historico.reduce((acc: any, curr) => {
    const semana = new Date(curr.data_treino).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const volume = curr.peso_kg * curr.repeticoes;

    if (!acc[semana]) {
      acc[semana] = { semana };
    }
    if (!acc[semana][curr.grupo_muscular]) {
      acc[semana][curr.grupo_muscular] = 0;
    }
    acc[semana][curr.grupo_muscular] += volume;

    return acc;
  }, {});

  const dadosEvolucaoArray = Object.values(dadosEvolucaoPorGrupo).sort(
    (a: any, b: any) => {
      const [diaA, mesA] = a.semana.split("/");
      const [diaB, mesB] = b.semana.split("/");
      return (
        new Date(2024, parseInt(mesA) - 1, parseInt(diaA)).getTime() -
        new Date(2024, parseInt(mesB) - 1, parseInt(diaB)).getTime()
      );
    }
  );

  // Preparar dados para comparação de volume total por grupo
  const dadosVolumePorGrupo = historico.reduce((acc: any[], curr) => {
    const grupoExistente = acc.find(
      (item) => item.grupo === curr.grupo_muscular
    );
    const volume = curr.peso_kg * curr.repeticoes;
    if (grupoExistente) {
      grupoExistente.volume_total += volume;
      grupoExistente.series += 1;
    } else {
      acc.push({
        grupo: curr.grupo_muscular,
        volume_total: volume,
        series: 1,
      });
    }
    return acc;
  }, []);

  // Dados para o gráfico de radar (equilíbrio muscular)
  const dadosRadar = dadosVolumePorGrupo.map((item) => ({
    grupo: item.grupo.replace("Pernas - ", "").slice(0, 15),
    volume: Math.round(item.volume_total / 1000), // Dividir por 1000 para melhor visualização
    series: item.series,
  }));

  // Frequência de treino por grupo
  const frequenciaPorGrupo = historico.reduce((acc: any, curr) => {
    if (!acc[curr.grupo_muscular]) {
      acc[curr.grupo_muscular] = new Set();
    }
    acc[curr.grupo_muscular].add(curr.data_treino);
    return acc;
  }, {});

  const dadosFrequencia = Object.entries(frequenciaPorGrupo)
    .map(([grupo, datas]: [string, any]) => ({
      grupo,
      dias_treinados: datas.size,
      porcentagem: (
        (datas.size /
          [...new Set(historico.map((h) => h.data_treino))].length) *
        100
      ).toFixed(0),
    }))
    .sort((a, b) => b.dias_treinados - a.dias_treinados);

  const gruposUnicos = [...new Set(historico.map((h) => h.grupo_muscular))];

  return (
    <div className="space-y-6">
      {/* Evolução de Peso por Exercício */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          📈 Evolução de Peso por Exercício
        </h2>

        <select
          value={exercicioSelecionado}
          onChange={(e) => setExercicioSelecionado(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        >
          {exercicios.map((ex) => (
            <option key={ex} value={ex}>
              {ex}
            </option>
          ))}
        </select>

        {dadosExercicio.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosExercicio}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-gray-300 dark:stroke-gray-600"
              />
              <XAxis
                dataKey="data"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  })
                }
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0, 0, 0, 0.8)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("pt-BR")
                }
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="peso_maximo"
                name="Peso Máximo (kg)"
                stroke="#06b6d4"
                strokeWidth={3}
                dot={{ fill: "#06b6d4", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-500 py-8">
            Nenhum dado disponível
          </p>
        )}
      </div>

      {/* Evolução de Volume por Grupo Muscular ao Longo do Tempo */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          📊 Evolução de Volume por Grupo Muscular
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Veja como cada grupo muscular está evoluindo ao longo do tempo
        </p>

        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosEvolucaoArray}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-300 dark:stroke-gray-600"
            />
            <XAxis dataKey="semana" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            {gruposUnicos.map((grupo) => (
              <Line
                key={grupo}
                type="monotone"
                dataKey={grupo}
                name={grupo}
                stroke={
                  CORES_GRUPOS[grupo as keyof typeof CORES_GRUPOS] || "#06b6d4"
                }
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Equilíbrio Muscular - Radar Chart */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          🎯 Equilíbrio de Desenvolvimento Muscular
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Análise visual do equilíbrio entre grupos musculares
        </p>

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={dadosRadar}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="grupo" className="text-xs" />
            <PolarRadiusAxis className="text-xs" />
            <Radar
              name="Volume (mil kg)"
              dataKey="volume"
              stroke="#06b6d4"
              fill="#06b6d4"
              fillOpacity={0.6}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Frequência de Treino por Grupo */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          📅 Frequência de Treino por Grupo Muscular
        </h2>

        <div className="space-y-3">
          {dadosFrequencia.map((item) => (
            <div key={item.grupo}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {item.grupo}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.dias_treinados} dias ({item.porcentagem}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${item.porcentagem}%`,
                    backgroundColor:
                      CORES_GRUPOS[item.grupo as keyof typeof CORES_GRUPOS] ||
                      "#06b6d4",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparação de Volume Total */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          💪 Volume Total por Grupo Muscular
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dadosVolumePorGrupo}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-300 dark:stroke-gray-600"
            />
            <XAxis
              dataKey="grupo"
              angle={-45}
              textAnchor="end"
              height={120}
              className="text-xs"
            />
            <YAxis className="text-xs" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "#fff",
              }}
            />
            <Legend />
            <Bar
              dataKey="volume_total"
              name="Volume Total (kg)"
              fill="#06b6d4"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela de Evolução */}
      <div className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          📋 Resumo de Evolução por Exercício
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Exercício
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Peso Inicial
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Peso Máximo
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Último Peso
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                  Progresso
                </th>
              </tr>
            </thead>
            <tbody>
              {evolucaoGeral.map((ev, idx) => {
                const progresso = ev.peso_inicial
                  ? (
                      ((ev.peso_maximo - ev.peso_inicial) / ev.peso_inicial) *
                      100
                    ).toFixed(1)
                  : "0";
                return (
                  <tr
                    key={`${ev.exercicio}-${idx}`}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-100">
                      {ev.exercicio}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                      {ev.peso_inicial?.toFixed(1) || "-"} kg
                    </td>
                    <td className="py-3 px-4 text-center font-semibold text-cyan-600">
                      {ev.peso_maximo?.toFixed(1) || "-"} kg
                    </td>
                    <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                      {ev.ultimo_peso?.toFixed(1) || "-"} kg
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          parseFloat(progresso) > 0
                            ? "bg-green-500/20 text-green-700 dark:text-green-400"
                            : "bg-gray-500/20 text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {parseFloat(progresso) > 0 ? "+" : ""}
                        {progresso}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
