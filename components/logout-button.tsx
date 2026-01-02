// components/logout-button.tsx
"use client";

import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      toast.success("Logout realizado com sucesso!");

      router.refresh();
      router.push("/auth/login");
    } catch (error) {
      toast.error("Erro ao fazer logout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={loading}
      size="sm"
      variant="outline"
    >
      {loading ? "Saindo..." : "Sair"}
    </Button>
  );
}
