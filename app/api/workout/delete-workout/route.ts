import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const { data_treino } = await request.json();

    if (!data_treino) {
      return NextResponse.json({ error: "Data inválida" }, { status: 400 });
    }

    console.log("Deletando treino da data:", data_treino);

    // Deletar todo o histórico daquela data
    const { error } = await supabase
      .from("historico_exercicios")
      .delete()
      .eq("user_id", user.id)
      .eq("data_treino", data_treino);

    if (error) {
      console.error("Erro ao deletar:", error);
      return NextResponse.json(
        { error: "Erro ao deletar treino" },
        { status: 500 }
      );
    }

    // 🔥 DESMARCAR HÁBITO DE TREINO
    try {
      const { data: habito } = await supabase
        .from("habitos")
        .select("id")
        .eq("user_id", user.id)
        .eq("ativo", true)
        .ilike("nome", "%treino%")
        .maybeSingle();

      if (habito) {
        // Deletar o registro do hábito daquela data
        await supabase
          .from("historico_habitos")
          .delete()
          .eq("habito_id", habito.id)
          .eq("data", data_treino);

        console.log("✅ Hábito desmarcado para data:", data_treino);
      }
    } catch (habitoError) {
      console.error("Erro ao desmarcar hábito (não crítico):", habitoError);
    }

    console.log("✅ Treino deletado com sucesso");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no endpoint:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
