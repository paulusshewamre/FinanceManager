"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import { Button } from "@/components/ui/button";

export function LandingThemeToggle() {
  const { data: session } = useSession();
  const { theme, updatePreferences } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const [localTheme, setLocalTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const isDocLight = document.documentElement.classList.contains("light");
      setLocalTheme(isDocLight ? "light" : "dark");
    }
  }, []);

  useEffect(() => {
    if (mounted && theme) {
      if (theme === "light" || theme === "dark") {
        setLocalTheme(theme);
      }
    }
  }, [mounted, theme]);

  const isDark = localTheme === "dark";

  const toggleTheme = () => {
    const nextTheme: "dark" | "light" = isDark ? "light" : "dark";
    setLocalTheme(nextTheme);

    if (typeof window !== "undefined") {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.removeAttribute("data-theme");
      root.classList.add(nextTheme);
      root.setAttribute("data-theme", nextTheme);
      localStorage.setItem("finance_manager_theme", nextTheme);
    }

    if (session?.user) {
      updatePreferences({ themePreference: nextTheme });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      suppressHydrationWarning
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} mode` : "Toggle theme"}
      className="h-9 w-9 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/70 hover:border-primary/40 text-foreground transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
    >
      {mounted ? (
        isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-primary animate-in spin-in-90 duration-300" />
        )
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
