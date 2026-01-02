export function Hero() {
  return (
    <div className="flex flex-col gap-16 mt-20 items-center">
      <h1 className="sr-only">Supabase and Next.js Starter Template</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Hora de dar um fim na desorganização da sua vida com o{" "}
        <span className="font-bold hover:underline bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
          Life Organizer
        </span>{" "}
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
