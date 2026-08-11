"use client";

import Link from "next/link";
import { Wallet, LayoutDashboard, Tag, CreditCard } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { LogoutButton } from "@/components/layout/logout-button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#303539] bg-[#161a1d]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-[#38bdf8]/10 rounded-xl border border-[#38bdf8]/20 text-[#38bdf8] group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-[#dee3e8] tracking-tight">
              Finance<span className="text-[#38bdf8]">Manager</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
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
              href="/categories"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] transition-colors"
            >
              <Tag className="w-4 h-4" />
              Categories
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-[#dee3e8]">
                {session.user.name || "User"}
              </span>
              <span className="text-[11px] text-[#94a3b8]">
                {session.user.email}
              </span>
            </div>
          )}

          <div className="h-6 w-px bg-[#303539] hidden sm:block" />

          <LogoutButton variant="outline" className="border-[#303539] bg-[#1b2024] hover:bg-rose-500/10 text-rose-400 border-rose-500/20" />
        </div>
      </div>
    </header>
  );
}
