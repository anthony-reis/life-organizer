// components/ui/header.tsx
"use client";

import Link from "next/link";
import React, { useState, Suspense } from "react";
import { EnvVarWarning } from "../env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { AuthButton } from "../auth-button";
import Logo from "./logo";
import { ThemeSwitcher } from "../theme-switcher";
import { Menu, X } from "lucide-react";

function Header() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 sticky top-0 bg-background z-50">
      <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Logo />

          {/* Desktop Theme Switcher */}
          <div className="hidden sm:flex items-center gap-2">
            <ThemeSwitcher />
          </div>
        </div>

        {/* Desktop Auth Button */}
        <div className="hidden sm:block">
          {!hasEnvVars ? (
            <EnvVarWarning />
          ) : (
            <Suspense
              fallback={
                <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              }
            >
              <AuthButton />
            </Suspense>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuAberto(!menuAberto)}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Menu"
        >
          {menuAberto ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuAberto && (
        <div className="sm:hidden absolute top-16 left-0 right-0 bg-background border-b border-foreground/10 shadow-lg">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-foreground/10">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Tema
              </span>
              <ThemeSwitcher />
            </div>

            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense
                fallback={
                  <div className="w-full h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                }
              >
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Header;
