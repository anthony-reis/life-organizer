import {
  AppleIcon,
  BookOpenTextIcon,
  DumbbellIcon,
  ListTodoIcon,
} from "lucide-react";
import Link from "next/link";
import React from "react";

function ControlCenter() {
  return (
    <div className="grid sm:grid-cols-2 gap-4 mt-6 mb-4">
      <Link
        href={"/"}
        className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group"
      >
        <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
          <ListTodoIcon className="w-6 h-6 text-cyan-500" />
        </div>
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 group-hover:text-cyan-500 transition-colors">
          Tarefas
        </span>
      </Link>

      <Link
        href={"/workout"}
        className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group"
      >
        <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
          <DumbbellIcon className="w-6 h-6 text-cyan-500" />
        </div>
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 group-hover:text-cyan-500 transition-colors">
          Treinos
        </span>
      </Link>

      <Link
        href={"/"}
        className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group"
      >
        <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
          <AppleIcon className="w-6 h-6 text-cyan-500" />
        </div>
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 group-hover:text-cyan-500 transition-colors">
          Dieta
        </span>
      </Link>

      <Link
        href={"/read"}
        className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group"
      >
        <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
          <BookOpenTextIcon className="w-6 h-6 text-cyan-500" />
        </div>
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 group-hover:text-cyan-500 transition-colors">
          Leituras
        </span>
      </Link>
    </div>
  );
}

export default ControlCenter;
