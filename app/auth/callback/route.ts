import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("❌ Erro ao trocar código:", error);

      // 🔥 VERIFICAR SE USUÁRIO JÁ FOI CONFIRMADO (pré-carregamento de email)
      // Tentar buscar usuário mesmo com erro
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email_confirmed_at) {
        console.log(
          "✅ Usuário já confirmado anteriormente, redirecionando..."
        );
        revalidatePath("/", "layout");
        return NextResponse.redirect(`${origin}/auth/login?confirmed=true`);
      }

      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent(error.message)}`
      );
    }

    // Revalidar todas as páginas para atualizar o header
    revalidatePath("/", "layout");

    console.log("✅ Email confirmado com sucesso!");

    // Redirecionar para login
    return NextResponse.redirect(`${origin}/auth/login?confirmed=true`);
  }

  return NextResponse.redirect(
    `${origin}/auth/error?error=Código de verificação ausente`
  );
}
