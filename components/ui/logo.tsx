import { cn } from "@/lib/utils";
import { BrainCogIcon, SquareDashedBottomCodeIcon } from "lucide-react";
import Link from "next/link";

function Logo({
  fontSize = "2xl",
  iconSize = 20,
}: {
  fontSize?: string;
  iconSize?: number;
}) {
  return (
    <Link
      href={"/"}
      className={cn(
        "text-2xl font-extrabold flex items-center gap-2",
        fontSize
      )}
    >
      <div className="rounded-xl bg-gradient-to-r from-cyan-500 to bg-cyan-600 p-2">
        <BrainCogIcon size={iconSize} className="stroke-white" />
      </div>
      <div>
        <span className="bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent">
          Life
        </span>
        <span className="text-stone-700 dark:text-stone-300">Organizer</span>
      </div>
    </Link>
  );
}

export default Logo;
