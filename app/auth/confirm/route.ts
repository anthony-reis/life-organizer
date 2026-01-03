import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      console.log("✅ Email confirmado com sucesso!");
      redirect("/auth/login?confirmed=true");
    } else {
      console.error("❌ Erro ao verificar OTP:", error);

      // 🔥 VERIFICAR SE USUÁRIO JÁ FOI CONFIRMADO
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && user.email_confirmed_at) {
        console.log("✅ Usuário já confirmado anteriormente");
        redirect("/auth/login?confirmed=true");
      }

      redirect(`/auth/error?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Token inválido
  redirect(`/auth/error?error=Token inválido ou expirado`);
}
