"use client";

import Link from "next/link";
import { Wallet, LayoutDashboard, Tag, CreditCard, PieChart, PiggyBank, LineChart, Settings } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import { LogoutButton } from "@/components/layout/logout-button";

export function Navbar() {
  const { data: session } = useSession();
  const { displayName } = useUserPreferences();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#303539] bg-[#161a1d]/90 backdrop-blur-md" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
        <div className="flex items-center gap-8" suppressHydrationWarning>
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-[#38bdf8]/10 rounded-xl border border-[#38bdf8]/20 text-[#38bdf8] group-hover:scale-105 transition-transform" suppressHydrationWarning>
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-[#dee3e8] tracking-tight">
              Finance<span className="text-[#38bdf8]">Manager</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" suppressHydrationWarning>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[#38bdf8]" />
              Dashboard
            </Link>
            <Link
              href="/transactions"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <CreditCard className="w-4 h-4 text-[#38bdf8]" />
              Transactions
            </Link>
            <Link
              href="/budgets"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <PieChart className="w-4 h-4 text-[#38bdf8]" />
              Budgets
            </Link>
            <Link
              href="/savings"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <PiggyBank className="w-4 h-4 text-[#38bdf8]" />
              Savings
            </Link>
            <Link
              href="/analytics"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <LineChart className="w-4 h-4 text-[#38bdf8]" />
              Analytics
            </Link>
            <Link
              href="/categories"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <Tag className="w-4 h-4" />
              Categories
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <Settings className="w-4 h-4 text-[#38bdf8]" />
              Settings
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4" suppressHydrationWarning>
          {session?.user && (
            <div className="hidden sm:flex flex-col text-right" suppressHydrationWarning>
              <span className="text-xs font-semibold text-[#dee3e8]">
                {displayName || session.user.name || "User"}
              </span>
              <span className="text-[11px] text-[#94a3b8]">
                {session.user.email}
              </span>
            </div>
          )}

          <div className="h-6 w-px bg-[#303539] hidden sm:block" suppressHydrationWarning />

          <LogoutButton variant="outline" className="border-[#303539] bg-[#1b2024] hover:bg-rose-500/10 text-rose-400 border-rose-500/20" />
        </div>
      </div>
    </header>
  );
}
