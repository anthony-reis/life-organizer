// components/ui/header.tsx (Server Component)
import Link from "next/link";
import React, { Suspense } from "react";
import { EnvVarWarning } from "../env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { AuthButton } from "../auth-button";
import Logo from "./logo";
import { ThemeSwitcher } from "../theme-switcher";
import { MobileMenu } from "./mobile-menu";

function Header() {
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

        {/* Mobile Menu Button & Dropdown */}
        <MobileMenu>
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
        </MobileMenu>
      </div>
    </nav>
  );
}

export default Header;
