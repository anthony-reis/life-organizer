// components/ui/mobile-menu.tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { ThemeSwitcher } from "../theme-switcher";

export function MobileMenu({ children }: { children: React.ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuAberto(!menuAberto)}
        className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Menu"
      >
        {menuAberto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
      {menuAberto && (
        <div className="sm:hidden fixed top-16 left-0 right-0 bg-background border-b border-foreground/10 shadow-lg">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-foreground/10">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                Tema
              </span>
              <ThemeSwitcher />
            </div>

            {children}
          </div>
        </div>
      )}
    </>
  );
}
