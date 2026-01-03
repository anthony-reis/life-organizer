"use client";
import { LoginForm } from "@/components/login-form";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react"; // 🔥 Importar Suspense
import { toast } from "react-toastify";

function LoginContent() {
  const searchParams = useSearchParams();
  const confirmed = searchParams?.get("confirmed");

  useEffect(() => {
    if (confirmed === "true") {
      toast.success("Email confirmado! Agora você pode fazer login 🎉");
    }
  }, [confirmed]);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
