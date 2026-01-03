"use client";

import {
  AppleIcon,
  BookOpenTextIcon,
  DollarSignIcon,
  DumbbellIcon,
  ListTodoIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function ControlCenter() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  }

  const handleNavigation = (e: React.MouseEvent, path: string) => {
    e.preventDefault();

    if (!user) {
      router.push("/auth/login");
    } else {
      router.push(path);
    }
  };

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 gap-4 mt-6 mb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-gray-500/10 to-gray-600/5 border border-gray-500/20 animate-pulse"
          >
            <div className="p-3 rounded-lg bg-gray-500/10 w-12 h-12" />
            <div className="h-6 bg-gray-500/10 rounded w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4 mt-6 mb-4">
      <Link
        href="/habits"
        onClick={(e) => handleNavigation(e, "/habits")}
        className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 group"
      >
        <div className="p-3 rounded-lg bg-cyan-500/10 group-hover:bg-cyan-500/20 transition-colors">
          <ListTodoIcon className="w-6 h-6 text-cyan-500" />
        </div>
        <span className="font-semibold text-lg text-gray-800 dark:text-gray-100 group-hover:text-cyan-500 transition-colors">
          Hábitos
        </span>
      </Link>

      <Link
        href="/workout"
        onClick={(e) => handleNavigation(e, "/workout")}
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
        href="/"
        onClick={(e) => handleNavigation(e, "/")}
        className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-br from-zinc-500/10 to-zinc-600/5 border border-zinc-500/20 hover:border-zinc-500/40 hover:shadow-lg hover:shadow-zinc-500/10 transition-all duration-300 group"
      >
        <div className="p-3 rounded-lg bg-zinc-500/10 group-hover:bg-zinc-500/20 transition-colors">
          <DollarSignIcon className="w-6 h-6 text-zinc-500" />
        </div>
        <span className="font-semibold text-lg text-gray-800 dark:text-zinc-500 group-hover:text-zinc-500 transition-colors">
          Financeiro
        </span>
      </Link>

      <Link
        href="/read"
        onClick={(e) => handleNavigation(e, "/read")}
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
