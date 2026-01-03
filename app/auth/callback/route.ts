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
      return NextResponse.redirect(
        `${origin}/auth/error?error=${encodeURIComponent(error.message)}`
      );
    }

    // Revalidar todas as páginas para atualizar o header
    revalidatePath("/", "layout");

    console.log("✅ Email confirmado com sucesso!");

    // Redirecionar para home
    return NextResponse.redirect(`${origin}/`);
  }

  return NextResponse.redirect(
    `${origin}/auth/error?error=Código de verificação ausente`
  );
}
