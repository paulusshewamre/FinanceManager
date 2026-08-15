"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { safeFetch } from "@/lib/api/safe-fetch";
import { DEFAULT_CURRENCY_SYMBOL } from "@/lib/validations/profile";

interface UserPreferencesContextType {
  currencySymbol: string;
  theme: "dark" | "light" | "system";
  displayName: string;
  isLoading: boolean;
  formatCurrency: (amount: number | string, options?: { showSign?: boolean }) => string;
  updatePreferences: (updates: {
    displayName?: string;
    preferredCurrencySymbol?: string;
    themePreference?: "dark" | "light" | "system";
  }) => Promise<boolean>;
  refreshPreferences: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType>({
  currencySymbol: DEFAULT_CURRENCY_SYMBOL,
  theme: "dark",
  displayName: "",
  isLoading: true,
  formatCurrency: (amount) => `${DEFAULT_CURRENCY_SYMBOL}${Number(amount || 0).toFixed(2)}`,
  updatePreferences: async () => false,
  refreshPreferences: async () => {},
});

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  const [currencySymbol, setCurrencySymbol] = useState<string>(DEFAULT_CURRENCY_SYMBOL);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [displayName, setDisplayName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Apply theme class to document element
  const applyThemeToDOM = useCallback((themePref: "dark" | "light" | "system") => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.removeAttribute("data-theme");

    let activeTheme = themePref;
    if (themePref === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    root.classList.add(activeTheme);
    root.setAttribute("data-theme", activeTheme);
    localStorage.setItem("finance_manager_theme", activeTheme);
  }, []);

  const fetchProfilePreferences = useCallback(async () => {
    try {
      const res = await safeFetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          const symbol = data.profile.preferredCurrencySymbol || DEFAULT_CURRENCY_SYMBOL;
          const themePref = (data.profile.themePreference as "dark" | "light" | "system") || "dark";
          const name = data.profile.displayName || data.user?.name || "";

          setCurrencySymbol(symbol);
          setTheme(themePref);
          setDisplayName(name);
          applyThemeToDOM(themePref);

          localStorage.setItem("finance_manager_currency", symbol);
        }
      }
    } catch (err) {
      console.warn("[UserPreferencesProvider] Failed to fetch profile preferences:", err);
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeToDOM]);

  useEffect(() => {
    // Check initial cached values from localStorage for instant render
    if (typeof window !== "undefined") {
      const cachedTheme = localStorage.getItem("finance_manager_theme") as "dark" | "light" | null;
      const cachedCurrency = localStorage.getItem("finance_manager_currency");

      if (cachedTheme) {
        setTheme(cachedTheme);
        applyThemeToDOM(cachedTheme);
      }
      if (cachedCurrency) {
        setCurrencySymbol(cachedCurrency);
      }
    }

    if (session?.user) {
      fetchProfilePreferences();
    } else {
      setIsLoading(false);
    }
  }, [session?.user, fetchProfilePreferences, applyThemeToDOM]);

  const updatePreferences = async (updates: {
    displayName?: string;
    preferredCurrencySymbol?: string;
    themePreference?: "dark" | "light" | "system";
  }): Promise<boolean> => {
    // Optimistic UI updates
    if (updates.preferredCurrencySymbol) {
      setCurrencySymbol(updates.preferredCurrencySymbol);
      localStorage.setItem("finance_manager_currency", updates.preferredCurrencySymbol);
    }
    if (updates.themePreference) {
      setTheme(updates.themePreference);
      applyThemeToDOM(updates.themePreference);
    }
    if (updates.displayName) {
      setDisplayName(updates.displayName);
    }

    const payload: Record<string, string> = {};
    if (updates.displayName && updates.displayName.trim()) {
      payload.displayName = updates.displayName.trim();
    }
    if (updates.preferredCurrencySymbol) {
      payload.preferredCurrencySymbol = updates.preferredCurrencySymbol;
    }
    if (updates.themePreference) {
      payload.themePreference = updates.themePreference;
    }

    try {
      const res = await safeFetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile preferences");
      }

      if (data.profile) {
        const updatedSymbol = data.profile.preferredCurrencySymbol || currencySymbol;
        const updatedTheme = data.profile.themePreference || theme;
        const updatedName = data.profile.displayName || displayName;

        setCurrencySymbol(updatedSymbol);
        setTheme(updatedTheme);
        setDisplayName(updatedName);
        applyThemeToDOM(updatedTheme);

        localStorage.setItem("finance_manager_currency", updatedSymbol);
      }

      return true;
    } catch (err) {
      console.error("[UserPreferencesProvider] Update error:", err);
      // Revert from server state on failure
      await fetchProfilePreferences();
      return false;
    }
  };

  const formatCurrency = useCallback(
    (amount: number | string, options?: { showSign?: boolean }): string => {
      const num = typeof amount === "number" ? amount : parseFloat(amount) || 0;
      const isNegative = num < 0;
      const absFormatted = Math.abs(num).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      if (isNegative) {
        return `-${currencySymbol}${absFormatted}`;
      }
      if (options?.showSign && num > 0) {
        return `+${currencySymbol}${absFormatted}`;
      }
      return `${currencySymbol}${absFormatted}`;
    },
    [currencySymbol]
  );

  return (
    <UserPreferencesContext.Provider
      value={{
        currencySymbol,
        theme,
        displayName: displayName || session?.user?.name || "User",
        isLoading,
        formatCurrency,
        updatePreferences,
        refreshPreferences: fetchProfilePreferences,
      }}
    >
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
}
