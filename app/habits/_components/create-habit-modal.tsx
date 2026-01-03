"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/text-area";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { criarHabito } from "../actions";

const DIAS_SEMANA = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

export default function CreateHabitModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [periodicidade, setPeriodicidade] = useState("DIARIO");
  const [diasSemana, setDiasSemana] = useState<number[]>([]);
  const [diaMes, setDiaMes] = useState(1);
  const [xpGanho, setXpGanho] = useState(10);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const toggleDiaSemana = (dia: number) => {
    setDiasSemana((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validações
    if (["SEMANAL", "TRES_SEMANA", "CINCO_SEMANA"].includes(periodicidade)) {
      if (diasSemana.length === 0) {
        toast.error("Selecione pelo menos um dia da semana");
        setLoading(false);
        return;
      }

      if (periodicidade === "SEMANAL" && diasSemana.length !== 1) {
        toast.error("Selecione apenas 1 dia para hábitos semanais");
        setLoading(false);
        return;
      }

      if (periodicidade === "TRES_SEMANA" && diasSemana.length !== 3) {
        toast.error("Selecione exatamente 3 dias da semana");
        setLoading(false);
        return;
      }

      if (periodicidade === "CINCO_SEMANA" && diasSemana.length !== 5) {
        toast.error("Selecione exatamente 5 dias da semana");
        setLoading(false);
        return;
      }
    }

    const result = await criarHabito({
      nome,
      descricao,
      periodicidade,
      diasSemana: ["SEMANAL", "TRES_SEMANA", "CINCO_SEMANA"].includes(
        periodicidade
      )
        ? diasSemana
        : null,
      diaMes: periodicidade === "MENSAL" ? diaMes : null,
      xpGanho,
    });

    if (result.success) {
      toast.success("Hábito criado com sucesso! 🎉");
      router.refresh();
      onClose();
    } else {
      toast.error(result.error || "Erro ao criar hábito");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Criar Novo Hábito
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nome */}
          <div>
            <Label htmlFor="nome">Nome do Hábito *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Ler 30 minutos"
              required
              maxLength={200}
            />
          </div>

          {/* Descrição */}
          <div>
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes sobre o hábito..."
              rows={3}
            />
          </div>

          {/* Periodicidade */}
          <div>
            <Label htmlFor="periodicidade">Periodicidade *</Label>
            <select
              id="periodicidade"
              value={periodicidade}
              onChange={(e) => {
                setPeriodicidade(e.target.value);
                setDiasSemana([]);
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="DIARIO">Todos os dias</option>
              <option value="SEMANAL">1x por semana</option>
              <option value="TRES_SEMANA">3x por semana</option>
              <option value="CINCO_SEMANA">5x por semana</option>
              <option value="QUINZENAL">A cada 15 dias</option>
              <option value="MENSAL">1x por mês</option>
            </select>
          </div>

          {/* Dias da Semana */}
          {["SEMANAL", "TRES_SEMANA", "CINCO_SEMANA"].includes(
            periodicidade
          ) && (
            <div>
              <Label>
                Dias da Semana *{" "}
                {periodicidade === "SEMANAL" && "(selecione 1)"}
                {periodicidade === "TRES_SEMANA" && "(selecione 3)"}
                {periodicidade === "CINCO_SEMANA" && "(selecione 5)"}
              </Label>
              <div className="flex gap-2 mt-2">
                {DIAS_SEMANA.map((dia) => (
                  <button
                    key={dia.value}
                    type="button"
                    onClick={() => toggleDiaSemana(dia.value)}
                    className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                      diasSemana.includes(dia.value)
                        ? "bg-purple-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/20"
                    }`}
                  >
                    {dia.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dia do Mês */}
          {periodicidade === "MENSAL" && (
            <div>
              <Label htmlFor="diaMes">Dia do Mês (1-31) *</Label>
              <Input
                id="diaMes"
                type="number"
                min={1}
                max={31}
                value={diaMes}
                onChange={(e) => setDiaMes(parseInt(e.target.value))}
                required
              />
            </div>
          )}

          {/* XP Ganho */}
          <div>
            <Label htmlFor="xpGanho">XP ao Completar *</Label>
            <Input
              id="xpGanho"
              type="number"
              min={1}
              max={1000}
              value={xpGanho}
              onChange={(e) => setXpGanho(parseInt(e.target.value))}
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Você perde o dobro ({xpGanho * 2} XP) se não concluir
            </p>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Criando..." : "Criar Hábito"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
