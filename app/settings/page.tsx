"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  User,
  Moon,
  Sun,
  Laptop,
  AlertOctagon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Globe,
} from "lucide-react";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";
import { useUserPreferences } from "@/lib/context/user-preferences-context";

interface UserProfileData {
  user: {
    id: string;
    name: string | null;
    email: string;
    createdAt: string;
  };
  profile: {
    id: string;
    displayName: string;
    preferredCurrencySymbol: string;
    themePreference: string;
  };
}

export default function SettingsPage() {
  const {
    currencySymbol,
    theme: currentTheme,
    displayName: currentDisplayName,
    updatePreferences,
  } = useUserPreferences();

  const [data, setData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form local state
  const [nameInput, setNameInput] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/profile");
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

  const handleSave = async (updates: {
    displayName?: string;
    preferredCurrencySymbol?: string;
    themePreference?: "dark" | "light" | "system";
  }) => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const success = await updatePreferences(updates);
      if (success) {
        setSuccessMessage("Preferences updated successfully!");
        if (updates.displayName) setNameInput(updates.displayName);
      } else {
        setError("Failed to update settings. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while saving profile settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[#1b2024] rounded-2xl border border-[#303539] shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8]">
                Preferences & Controls
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#dee3e8] tracking-tight flex items-center gap-2.5">
              <Settings className="w-7 h-7 text-[#38bdf8]" />
              Account Settings
            </h1>
            <p className="text-sm text-[#94a3b8]">
              Manage your display name, currency preferences, theme appearance, and data purging.
            </p>
          </div>
        </div>

        {/* Global Notifications */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#1b2024]/50 rounded-2xl border border-[#303539]">
            <Loader2 className="w-8 h-8 animate-spin text-[#38bdf8]" />
            <p className="text-xs text-[#94a3b8]">Loading settings & profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Section 1: User Profile */}
            <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8]">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#38bdf8]/10 rounded-xl border border-[#38bdf8]/20 text-[#38bdf8]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-[#dee3e8]">
                      Profile Details
                    </CardTitle>
                    <CardDescription className="text-xs text-[#94a3b8]">
                      Update your account display name and view account info.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                      Email Address (Read-only)
                    </label>
                    <Input
                      value={data?.user.email || ""}
                      disabled
                      className="bg-[#0f1418] border-[#303539] text-[#94a3b8] text-xs opacity-80 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                      Member Since
                    </label>
                    <Input
                      value={
                        data?.user.createdAt
                          ? new Date(data.user.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "N/A"
                      }
                      disabled
                      className="bg-[#0f1418] border-[#303539] text-[#94a3b8] text-xs opacity-80 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                    Display Name / Username
                  </label>
                  <Input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Enter your display name"
                    className="bg-[#0f1418] border-[#303539] text-[#dee3e8] text-xs focus:border-[#38bdf8]"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleSave({ displayName: nameInput })}
                    disabled={isSaving || !nameInput.trim()}
                    className="bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold px-4 py-2 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Profile Name
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Preferred Currency Selector (BR-018) */}
            <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8]">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-[#dee3e8]">
                      Display Currency Symbol (BR-018)
                    </CardTitle>
                    <CardDescription className="text-xs text-[#94a3b8]">
                      Select the primary currency symbol for financial metrics across your application.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { symbol: "$", label: "USD ($)", name: "US Dollar" },
                    { symbol: "€", label: "EUR (€)", name: "Euro" },
                    { symbol: "£", label: "GBP (£)", name: "British Pound" },
                    { symbol: "¥", label: "JPY (¥)", name: "Japanese Yen" },
                  ].map((curr) => {
                    const isSelected = currencySymbol === curr.symbol;
                    return (
                      <button
                        key={curr.symbol}
                        type="button"
                        onClick={() => handleSave({ preferredCurrencySymbol: curr.symbol })}
                        disabled={isSaving}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8] shadow-md ring-1 ring-[#38bdf8]"
                            : "bg-[#0f1418] border-[#303539] text-[#94a3b8] hover:text-[#dee3e8] hover:border-[#38bdf8]/40"
                        }`}
                      >
                        <span className="text-2xl font-bold font-mono">{curr.symbol}</span>
                        <span className="text-xs font-semibold">{curr.label}</span>
                        <span className="text-[10px] text-[#94a3b8]">{curr.name}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-[#0f1418] border border-[#303539] text-xs text-[#94a3b8] space-y-1">
                  <span className="font-semibold text-[#dee3e8] block">
                    ℹ️ Nominal Display Currency Prefix (BR-018):
                  </span>
                  <p className="leading-relaxed">
                    Changing your preferred currency symbol immediately updates dashboard balances, cashflow charts, budget progress bars, and savings goal milestones across all pages.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Appearance & Theme Preference */}
            <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8]">
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                    <Moon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-[#dee3e8]">
                      Appearance & Theme
                    </CardTitle>
                    <CardDescription className="text-xs text-[#94a3b8]">
                      Customize your visual theme interface preference.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "dark", label: "Dark Mode", icon: Moon, desc: "Slate dark aesthetic" },
                    { id: "light", label: "Light Mode", icon: Sun, desc: "Clean bright theme" },
                    { id: "system", label: "System Default", icon: Laptop, desc: "Sync with OS theme" },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = currentTheme === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleSave({ themePreference: t.id as "dark" | "light" | "system" })}
                        disabled={isSaving}
                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          isSelected
                            ? "bg-[#38bdf8]/10 border-[#38bdf8] text-[#38bdf8] shadow-md ring-1 ring-[#38bdf8]"
                            : "bg-[#0f1418] border-[#303539] text-[#94a3b8] hover:text-[#dee3e8] hover:border-[#38bdf8]/40"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <div className="text-center">
                          <span className="text-xs font-semibold block text-[#dee3e8]">{t.label}</span>
                          <span className="text-[10px] text-[#94a3b8]">{t.desc}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Danger Zone (BR-019 Account Deletion) */}
            <Card className="bg-[#1b2024] border-rose-500/40 text-[#dee3e8] relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />
              <CardHeader>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
                    <AlertOctagon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-rose-400">
                      Danger Zone — Permanent Account Deletion
                    </CardTitle>
                    <CardDescription className="text-xs text-[#94a3b8]">
                      Execute irreversible hard purging of your user profile and all financial ledger records.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Once you delete your account, there is no going back. All transactions, budget limits, savings milestones, custom categories, and session data will be permanently purged from the database per <span className="font-semibold text-rose-400">Business Rule BR-019</span>.
                </p>

                <div className="flex justify-start">
                  <Button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="bg-rose-600/20 text-rose-400 border border-rose-500/40 hover:bg-rose-600 hover:text-white font-semibold text-xs py-2 px-4 flex items-center gap-2 transition-all"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    Delete My Account & All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Danger Zone Account Deletion Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
