import ControlCenter from "@/components/control-center";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <div className="flex-1 flex flex-col gap-20 max-w-5xl p-5">
          <Hero />
          <main className="flex-1 flex flex-col gap-6 px-4">
            <h2 className="font-semibold text-2xl mb-4">Central de Controle</h2>
            <ControlCenter />
          </main>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Desenvolvido por{" "}
            <a
              href="https://www.linkedin.com/in/anthony-sa-reis/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Anthony Sá
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
