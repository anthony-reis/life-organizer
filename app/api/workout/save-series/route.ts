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

    const { treino_exercicio_id, series, data_treino } = await request.json();

    console.log("Salvando treino para data:", data_treino);

    if (!treino_exercicio_id || !series || !data_treino) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    // Inserir cada série no histórico com a data correta
    const historicoPromises = series.map((serie: any) =>
      supabase.from("historico_exercicios").insert({
        user_id: user.id,
        treino_exercicio_id,
        data_treino,
        serie_numero: serie.serie_numero,
        peso_kg: serie.peso_kg,
        repeticoes: serie.repeticoes,
      })
    );

    const results = await Promise.all(historicoPromises);

    // Verificar se algum insert falhou
    const erros = results.filter((r) => r.error);
    if (erros.length > 0) {
      console.error("Erros ao salvar:", erros);
      return NextResponse.json(
        { error: "Erro ao salvar algumas séries" },
        { status: 500 }
      );
    }

    console.log("✅ Treino salvo com sucesso para data:", data_treino);

    // 🔥 MARCAR HÁBITO DE TREINO COMO COMPLETO
    try {
      // Buscar hábito de treino (deve existir pois foi criado ao montar o treino)
      const { data: habitos } = await supabase
        .from("habitos")
        .select("id, nome")
        .eq("user_id", user.id)
        .eq("ativo", true)
        .ilike("nome", "%treino%")
        .maybeSingle();

      if (habitos) {
        console.log("Marcando hábito:", habitos.nome);

        // Verificar se já existe registro para esta data
        const { data: historicoExistente } = await supabase
          .from("historico_habitos")
          .select("id, concluido")
          .eq("habito_id", habitos.id)
          .eq("data", data_treino)
          .maybeSingle();

        if (historicoExistente) {
          // Atualizar apenas se não estava completo
          if (!historicoExistente.concluido) {
            await supabase
              .from("historico_habitos")
              .update({ concluido: true })
              .eq("id", historicoExistente.id);

            console.log("✅ Hábito atualizado como completo");
          }
        } else {
          // Criar novo registro
          await supabase.from("historico_habitos").insert({
            habito_id: habitos.id,
            data: data_treino,
            concluido: true,
          });

          console.log("✅ Hábito marcado como completo");
        }
      } else {
        console.log("⚠️ Hábito de treino não encontrado");
      }
    } catch (habitoError) {
      console.error("Erro ao marcar hábito (não crítico):", habitoError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro no endpoint:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
