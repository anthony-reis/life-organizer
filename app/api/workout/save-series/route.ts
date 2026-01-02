import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { treino_exercicio_id, series } = await request.json();
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const dataHoje = new Date().toISOString().split("T")[0];

    const seriesToInsert = series.map((serie: any) => ({
      user_id: user.id,
      treino_exercicio_id,
      data_treino: dataHoje,
      serie_numero: serie.serie_numero,
      peso_kg: serie.peso_kg,
      repeticoes: serie.repeticoes,
    }));

    const { error } = await supabase
      .from("historico_exercicios")
      .insert(seriesToInsert);

    if (error) {
      console.error("Erro Supabase:", error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao salvar séries:", error);
    return NextResponse.json(
      { error: "Erro ao salvar séries" },
      { status: 500 }
    );
  }
}
