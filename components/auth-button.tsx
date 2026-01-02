// components/auth-button.tsx
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-2 sm:gap-4">
      <span className="text-sm text-gray-600 dark:text-gray-400 hidden sm:inline">
        Hey, {user.email}!
      </span>
      <span className="text-sm text-gray-600 dark:text-gray-400 sm:hidden">
        {user.email?.split("@")[0]}
      </span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
        <Link href="/auth/login">Entrar</Link>
      </Button>
      <Button asChild size="sm" variant="default" className="w-full sm:w-auto">
        <Link href="/auth/sign-up">Cadastrar</Link>
      </Button>
    </div>
  );
}
