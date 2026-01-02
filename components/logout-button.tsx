// components/logout-button.tsx
"use client";

import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { toast } from "react-toastify";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);

    try {
      const supabase = createClient();
      await supabase.auth.signOut();

      toast.success("Logout realizado com sucesso!");

      // Força reload completo da página (igual F5)
      window.location.href = "/auth/login";
    } catch (error) {
      toast.error("Erro ao fazer logout");
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
