import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = "/auth/login"; // Mudar para ir para login

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Sucesso - redirecionar para login
      redirect(next);
    } else {
      // Erro na verificação
      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Token inválido
  redirect(`/auth/error?error=Token inválido ou expirado`);
}
