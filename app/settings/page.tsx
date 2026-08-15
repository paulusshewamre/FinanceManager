"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Shield,
  Palette,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  AlertOctagon,
  Sparkles,
  Settings,
  Globe,
  Save,
  Check,
  Mail,
  Calendar,
  Lock,
  KeyRound,
  ShieldAlert,
  Info,
} from "lucide-react";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import { safeFetch } from "@/lib/api/safe-fetch";
import {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY_SYMBOL,
  type SupportedCurrency,
} from "@/lib/validations/profile";

interface UserProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  profile: {
    displayName: string | null;
    preferredCurrencySymbol: string;
    themePreference: string;
  };
}

export default function SettingsPage() {
  const {
    currencySymbol: currentSymbol,
    theme: currentTheme,
    displayName: currentDisplayName,
    formatCurrency,
    updatePreferences,
  } = useUserPreferences();

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingName, setIsSavingName] = useState(false);
  const [savingCurrency, setSavingCurrency] = useState<string | null>(null);
  const [savingTheme, setSavingTheme] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form local state
  const [nameInput, setNameInput] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await safeFetch("/api/user/profile");
      if (!res.ok) {
        throw new Error("Failed to load user profile settings");
      }
      const profileData: UserProfileData = await res.json();
      setData(profileData);
      setNameInput(profileData.profile.displayName || profileData.user.name || currentDisplayName || "");
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching profile");
    } finally {
      setIsLoading(false);
    }
  }, [currentDisplayName]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Display Name save
  const handleSaveName = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nameInput.trim()) return;

    setIsSavingName(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const success = await updatePreferences({ displayName: nameInput.trim() });
      if (success) {
        setSuccessMessage("Display name updated successfully!");
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError("Failed to update display name. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while updating display name");
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle Currency Preference update
  const handleSelectCurrency = async (curr: SupportedCurrency) => {
    if (curr.symbol === currentSymbol) return;

    setSavingCurrency(curr.symbol);
    setError(null);
    setSuccessMessage(null);

    try {
      const success = await updatePreferences({ preferredCurrencySymbol: curr.symbol });
      if (success) {
        setSuccessMessage(`Primary currency updated to ${curr.name} (${curr.symbol})`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError(`Failed to update currency to ${curr.name}.`);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving currency preference");
    } finally {
      setSavingCurrency(null);
    }
  };

  // Handle Theme Preference update
  const handleSelectTheme = async (themePref: "dark" | "light" | "system") => {
    if (themePref === currentTheme) return;

    setSavingTheme(themePref);
    setError(null);
    setSuccessMessage(null);

    try {
      const success = await updatePreferences({ themePreference: themePref });
      if (success) {
        setSuccessMessage(`Theme set to ${themePref.charAt(0).toUpperCase() + themePref.slice(1)} mode`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        setError("Failed to update appearance theme.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving theme preference");
    } finally {
      setSavingTheme(null);
    }
  };

  // Derive user initials for profile avatar pill
  const userInitials = useMemo(() => {
    const name = nameInput.trim() || data?.user.name || currentDisplayName || "U";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [nameInput, data?.user.name, currentDisplayName]);

  const hasNameChanged = nameInput.trim() !== (data?.profile.displayName || data?.user.name || currentDisplayName);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200" suppressHydrationWarning>
      <Navbar />

      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-12 space-y-8" suppressHydrationWarning>
        {/* 3-Second Comprehension Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-card rounded-2xl border border-border shadow-xs" suppressHydrationWarning>
          <div className="space-y-1.5" suppressHydrationWarning>
            <div className="flex items-center gap-2" suppressHydrationWarning>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                User Profile & Preferences
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-primary shrink-0" />
              Settings & Preferences
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your personal identity, nominal display currency, theme appearance, and account security.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0" suppressHydrationWarning>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProfile}
              disabled={isLoading}
              className="gap-2 h-10 px-4 min-h-[44px] min-w-[44px] text-xs font-medium border-border hover:bg-muted/80 transition-colors"
              aria-label="Refresh settings and profile data"
              title="Refresh settings"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-primary" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        {/* Dynamic Feedback Banners */}
        {successMessage && (
          <div
            role="status"
            aria-live="polite"
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-2.5" suppressHydrationWarning>
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 dark:text-emerald-400 hover:opacity-75 p-1 rounded-md min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-1 duration-200"
            suppressHydrationWarning
          >
            <div className="flex items-center gap-2.5" suppressHydrationWarning>
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="text-destructive hover:bg-destructive/10 h-8 px-2 text-xs"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Loading Shimmer Skeletons vs Populated Cards */}
        {isLoading && !data ? (
          <div className="space-y-6 animate-pulse" aria-label="Loading settings content" suppressHydrationWarning>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-card border border-border/70 rounded-2xl p-6 space-y-4" suppressHydrationWarning>
                <div className="flex items-center gap-3" suppressHydrationWarning>
                  <div className="w-10 h-10 rounded-xl bg-muted" suppressHydrationWarning />
                  <div className="space-y-2 flex-1" suppressHydrationWarning>
                    <div className="h-4 w-40 bg-muted rounded-md" suppressHydrationWarning />
                    <div className="h-3 w-64 bg-muted rounded-md" suppressHydrationWarning />
                  </div>
                </div>
                <div className="h-20 bg-muted/40 rounded-xl" suppressHydrationWarning />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-8" suppressHydrationWarning>
            {/* SECTION 1: PROFILE & IDENTITY */}
            <section aria-labelledby="profile-heading" suppressHydrationWarning>
              <Card className="bg-card border-border shadow-xs" suppressHydrationWarning>
                <CardHeader suppressHydrationWarning>
                  <div className="flex items-center gap-3" suppressHydrationWarning>
                    <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                    <div suppressHydrationWarning>
                      <CardTitle id="profile-heading" className="text-lg font-bold text-foreground">
                        Profile & Identity
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Manage your user display name and view verified account information.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6" suppressHydrationWarning>
                  {/* Avatar Pill & Account ID Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/30 border border-border" suppressHydrationWarning>
                    <div className="flex items-center gap-3.5" suppressHydrationWarning>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-primary/60 text-primary-foreground font-bold text-base flex items-center justify-center shadow-xs ring-2 ring-primary/20 select-none">
                        {userInitials}
                      </div>
                      <div suppressHydrationWarning>
                        <h2 className="text-sm font-bold text-foreground">
                          {data?.profile.displayName || data?.user.name || currentDisplayName || "Personal User"}
                        </h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {data?.user.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground" suppressHydrationWarning>
                      <span className="px-2.5 py-1 rounded-md bg-background border border-border font-mono">
                        ID: {data?.user.id ? `${data.user.id.slice(0, 8)}...` : "Active"}
                      </span>
                    </div>
                  </div>

                  {/* Form Controls Grid */}
                  <form onSubmit={handleSaveName} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email (Read-Only) */}
                      <div className="space-y-1.5" suppressHydrationWarning>
                        <label
                          htmlFor="account-email"
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                        >
                          <span>Email Address</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Verified
                          </span>
                        </label>
                        <div className="relative">
                          <Input
                            id="account-email"
                            value={data?.user.email || ""}
                            disabled
                            readOnly
                            className="bg-muted/40 border-border text-muted-foreground text-xs opacity-90 cursor-not-allowed pl-9 h-11"
                          />
                          <Mail className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground/60" />
                        </div>
                      </div>

                      {/* Member Since (Read-Only) */}
                      <div className="space-y-1.5" suppressHydrationWarning>
                        <label
                          htmlFor="account-created"
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          Member Since
                        </label>
                        <div className="relative">
                          <Input
                            id="account-created"
                            value={
                              data?.user.createdAt
                                ? new Date(data.user.createdAt).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })
                                : "Active User"
                            }
                            disabled
                            readOnly
                            className="bg-muted/40 border-border text-muted-foreground text-xs opacity-90 cursor-not-allowed pl-9 h-11"
                          />
                          <Calendar className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground/60" />
                        </div>
                      </div>
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-1.5" suppressHydrationWarning>
                      <div className="flex items-center justify-between">
                        <label
                          htmlFor="display-name"
                          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                        >
                          Display Name / Alias
                        </label>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {nameInput.length}/50
                        </span>
                      </div>
                      <Input
                        id="display-name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="Enter your display name (e.g., Alex Carter)"
                        maxLength={50}
                        className="bg-background border-border text-foreground text-sm focus-visible:ring-primary h-11"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Your display name appears in the top navigation bar, welcoming banner, and account summaries.
                      </p>
                    </div>

                    {/* Save Name Action */}
                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={isSavingName || !nameInput.trim() || !hasNameChanged}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5 h-11 min-h-[44px] flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isSavingName ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        <span>Save Profile Name</span>
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </section>

            {/* SECTION 2: CURRENCY PREFERENCES (BR-018 + ETHIOPIAN BIRR FIRST-CLASS DEFAULT) */}
            <section aria-labelledby="currency-heading" suppressHydrationWarning>
              <Card className="bg-card border-border shadow-xs" suppressHydrationWarning>
                <CardHeader suppressHydrationWarning>
                  <div className="flex items-center gap-3" suppressHydrationWarning>
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div suppressHydrationWarning>
                      <div className="flex items-center gap-2" suppressHydrationWarning>
                        <CardTitle id="currency-heading" className="text-lg font-bold text-foreground">
                          Display Currency Preference (BR-018)
                        </CardTitle>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Active: {currentSymbol}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        Select your primary currency format. Ethiopian Birr (Br) is the default supported currency standard.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5" suppressHydrationWarning>
                  {/* Currency Selection Grid */}
                  <div
                    role="radiogroup"
                    aria-label="Display currency preferences"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
                    suppressHydrationWarning
                  >
                    {SUPPORTED_CURRENCIES.map((curr) => {
                      const isSelected = currentSymbol === curr.symbol;
                      const isSavingThis = savingCurrency === curr.symbol;
                      const isDefault = curr.symbol === DEFAULT_CURRENCY_SYMBOL;

                      return (
                        <button
                          key={curr.code}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleSelectCurrency(curr)}
                          disabled={savingCurrency !== null}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectCurrency(curr);
                            }
                          }}
                          className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 min-h-[96px] transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isSelected
                              ? "bg-primary/10 border-primary text-foreground shadow-xs ring-1 ring-primary"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/20"
                          }`}
                          suppressHydrationWarning
                        >
                          <div className="flex items-start justify-between w-full" suppressHydrationWarning>
                            <div className="flex items-center gap-2" suppressHydrationWarning>
                              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
                                {curr.symbol}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold font-mono bg-muted text-foreground border border-border">
                                {curr.code}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5" suppressHydrationWarning>
                              {isDefault && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  Default
                                </span>
                              )}
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                              {isSavingThis && (
                                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                              )}
                            </div>
                          </div>

                          <div suppressHydrationWarning>
                            <span className="text-xs font-bold block text-foreground">
                              {curr.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {curr.country} ({curr.label})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* BR-018 Live Preview & Information Callout */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-2" suppressHydrationWarning>
                    <div className="flex items-center gap-2 text-foreground font-semibold" suppressHydrationWarning>
                      <Info className="w-4 h-4 text-primary shrink-0" />
                      <span>Nominal Display Currency Policy (BR-018):</span>
                    </div>
                    <p className="leading-relaxed">
                      Selecting a new currency updates all monetary presentation across your <strong>Dashboard Hub</strong>, <strong>Transactions Ledger</strong>, <strong>Monthly Budgets</strong>, <strong>Savings Targets</strong>, and <strong>Analytics Charts</strong> instantaneously.
                    </p>
                    <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-4 text-xs font-mono" suppressHydrationWarning>
                      <span className="text-muted-foreground">Live Sample Preview:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        {formatCurrency(12500.5, { showSign: true })}
                      </span>
                      <span className="text-destructive font-bold">
                        {formatCurrency(-420.0)}
                      </span>
                      <span className="text-foreground font-bold">
                        {formatCurrency(85000)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SECTION 3: APPEARANCE & THEME */}
            <section aria-labelledby="theme-heading" suppressHydrationWarning>
              <Card className="bg-card border-border shadow-xs" suppressHydrationWarning>
                <CardHeader suppressHydrationWarning>
                  <div className="flex items-center gap-3" suppressHydrationWarning>
                    <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div suppressHydrationWarning>
                      <div className="flex items-center gap-2" suppressHydrationWarning>
                        <CardTitle id="theme-heading" className="text-lg font-bold text-foreground">
                          Appearance & Theme
                        </CardTitle>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary border border-primary/20 uppercase">
                          {currentTheme}
                        </span>
                      </div>
                      <CardDescription className="text-xs text-muted-foreground">
                        Customize your visual interface theme for optimal financial clarity.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent suppressHydrationWarning>
                  <div
                    role="radiogroup"
                    aria-label="Theme interface mode"
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    suppressHydrationWarning
                  >
                    {[
                      {
                        id: "dark" as const,
                        label: "Dark Mode",
                        icon: Moon,
                        desc: "Slate dark aesthetic with high contrast",
                      },
                      {
                        id: "light" as const,
                        label: "Light Mode",
                        icon: Sun,
                        desc: "Crisp bright financial paper theme",
                      },
                      {
                        id: "system" as const,
                        label: "System Default",
                        icon: Laptop,
                        desc: "Synchronize automatically with OS theme",
                      },
                    ].map((t) => {
                      const Icon = t.icon;
                      const isSelected = currentTheme === t.id;
                      const isSavingThis = savingTheme === t.id;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => handleSelectTheme(t.id)}
                          disabled={savingTheme !== null}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              handleSelectTheme(t.id);
                            }
                          }}
                          className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center gap-2.5 min-h-[104px] transition-all relative outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                            isSelected
                              ? "bg-primary/10 border-primary text-primary shadow-xs ring-1 ring-primary"
                              : "bg-background border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/20"
                          }`}
                          suppressHydrationWarning
                        >
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                          {isSavingThis && (
                            <div className="absolute top-2.5 right-2.5">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            </div>
                          )}
                          <Icon className="w-6 h-6 shrink-0" />
                          <div suppressHydrationWarning>
                            <span className="text-xs font-bold block text-foreground">{t.label}</span>
                            <span className="text-[10px] text-muted-foreground leading-tight">{t.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SECTION 4: ACCOUNT SECURITY & SESSION INFO */}
            <section aria-labelledby="security-heading" suppressHydrationWarning>
              <Card className="bg-card border-border shadow-xs" suppressHydrationWarning>
                <CardHeader suppressHydrationWarning>
                  <div className="flex items-center gap-3" suppressHydrationWarning>
                    <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-600 dark:text-blue-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div suppressHydrationWarning>
                      <CardTitle id="security-heading" className="text-lg font-bold text-foreground">
                        Account Security & Authentication
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Review active security policies and session management credentials.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4" suppressHydrationWarning>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" suppressHydrationWarning>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5" suppressHydrationWarning>
                      <div className="flex items-center gap-2 text-foreground font-semibold text-xs" suppressHydrationWarning>
                        <KeyRound className="w-4 h-4 text-primary" />
                        <span>Authentication Method</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Secure email and bcrypt-hashed password credentials managed via session cookies (Better Auth).
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1.5" suppressHydrationWarning>
                      <div className="flex items-center gap-2 text-foreground font-semibold text-xs" suppressHydrationWarning>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>Session Status</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Active encrypted browser session with sliding 7-day expiration window.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SECTION 5: DANGER ZONE (BR-019 ACCOUNT HARD PURGE) */}
            <section aria-labelledby="danger-heading" suppressHydrationWarning>
              <Card className="bg-card border-destructive/40 text-card-foreground relative overflow-hidden shadow-xs" suppressHydrationWarning>
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive" />
                <CardHeader suppressHydrationWarning>
                  <div className="flex items-center gap-3" suppressHydrationWarning>
                    <div className="p-2.5 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive">
                      <AlertOctagon className="w-5 h-5" />
                    </div>
                    <div suppressHydrationWarning>
                      <CardTitle id="danger-heading" className="text-lg font-bold text-destructive">
                        Danger Zone — Permanent Account Deletion
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Irreversible hard purge of your user account and all personal financial ledger records.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4" suppressHydrationWarning>
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2 text-xs text-foreground" suppressHydrationWarning>
                    <h3 className="font-semibold text-destructive flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      7-Table Cascading Data Hard Purge Policy (BR-019)
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Executing account deletion triggers an unrecoverable cascading delete across <strong>User profile</strong>, <strong>Transactions</strong>, <strong>Monthly Budgets</strong>, <strong>Savings Goals</strong>, <strong>Custom Categories</strong>, active <strong>Auth Sessions</strong>, and <strong>Linked Accounts</strong>.
                    </p>
                  </div>

                  <div className="flex justify-start pt-2" suppressHydrationWarning>
                    <Button
                      type="button"
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive hover:text-destructive-foreground font-semibold text-xs h-11 px-5 min-h-[44px] flex items-center gap-2 transition-all shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete My Account & All Data</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        )}
      </main>

      {/* Danger Zone Account Deletion Confirmation Modal (UI-003 ConfirmDialog) */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
