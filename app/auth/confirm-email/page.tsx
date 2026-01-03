import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ConfirmEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Mail className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">Verifique seu e-mail! 📧</CardTitle>
            <CardDescription>Enviamos um link de confirmação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Por favor, verifique seu e-mail e clique no link de confirmação
              para ativar sua conta.
            </p>

            <div className="rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 p-4">
              <div className="flex gap-3">
                <CheckCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">
                    Próximos passos:
                  </p>
                  <ul className="text-sm text-cyan-800 dark:text-cyan-200 space-y-1 list-disc list-inside">
                    <li>Abra sua caixa de e-mail</li>
                    <li>Clique no link de confirmação</li>
                    <li>Faça login na sua conta</li>
                  </ul>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Não recebeu? Verifique a caixa de spam
            </p>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-cyan-600 hover:text-cyan-700 underline"
              >
                Voltar para o login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
