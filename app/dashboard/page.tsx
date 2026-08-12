"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  AlertTriangle,
  AlertOctagon,
  Plus,
  ArrowRight,
  CreditCard,
  PieChart,
  Calendar,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "@/lib/auth/auth-client";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import { AddEditTransactionModal } from "@/components/transactions/add-edit-transaction-modal";

interface DashboardData {
  summary: {
    netBalance: number;
    totalIncomeAllTime: number;
    totalExpenseAllTime: number;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlyNet: number;
    savingsRate: number;
  };
  recentTransactions: Array<{
    id: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    merchantName: string;
    notes?: string;
    transactionDate: string;
    category?: {
      id: string;
      name: string;
      type: string;
    };
  }>;
  budgetAlerts: Array<{
    id: string;
    categoryId: string;
    categoryName: string;
    spent: number;
    limit: number;
    percentage: number;
    status: "WARNING" | "EXCEEDED";
  }>;
  savingsSummary: {
    totalSavingsTarget: number;
    totalSavingsAccumulated: number;
    activeGoalsCount: number;
    completedGoalsCount: number;
    topActiveGoals: Array<{
      id: string;
      name: string;
      targetAmount: number;
      accumulatedBalance: number;
      percentage: number;
      targetDate: string;
    }>;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { formatCurrency, displayName } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard");
      if (!res.ok) {
        throw new Error("Failed to load dashboard metrics");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, [fetchDashboardData]);

  const netBalance = data?.summary.netBalance || 0;
  const isPositiveNet = netBalance >= 0;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200 flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" suppressHydrationWarning>
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl" suppressHydrationWarning>
          <div className="space-y-1" suppressHydrationWarning>
            <div className="flex items-center gap-2" suppressHydrationWarning>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20">
                Financial Clarity Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Welcome back, {displayName || session?.user?.name || "User"}!
            </h1>
            <p className="text-sm text-[#94a3b8]">
              Here is your cashflow overview, budget warnings, and recent activity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0" suppressHydrationWarning>
            <Button
              onClick={() => setTxModalOpen(true)}
              className="bg-[#38bdf8] hover:bg-[#0284c7] text-[#0f172a] font-semibold flex items-center gap-1.5 shadow-lg shadow-[#38bdf8]/10 text-xs"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
            <Link href="/budgets">
              <Button variant="outline" className="border-[#303539] bg-[#1b2024] hover:bg-[#22272b] text-[#dee3e8] text-xs">
                <PieChart className="w-3.5 h-3.5 mr-1 text-[#38bdf8]" />
                Manage Budgets
              </Button>
            </Link>
            <Link href="/savings">
              <Button variant="outline" className="border-[#303539] bg-[#1b2024] hover:bg-[#22272b] text-[#dee3e8] text-xs">
                <PiggyBank className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Savings
              </Button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3" suppressHydrationWarning>
            <div className="w-8 h-8 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto" suppressHydrationWarning />
            <p className="text-sm text-[#94a3b8]">Loading financial summary...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {!loading && !error && data && (
          <div className="space-y-8">
            {/* Proactive Budget Alert Banner */}
            {data.budgetAlerts && data.budgetAlerts.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 shrink-0">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-amber-100">
                      Proactive Budget Threshold Alert ({data.budgetAlerts.length} Category Alert{data.budgetAlerts.length > 1 ? "s" : ""})
                    </h3>
                    <p className="text-xs text-amber-300/80">
                      {data.budgetAlerts[0].categoryName} has reached{" "}
                      <span className="font-bold">{data.budgetAlerts[0].percentage}%</span> of its limit ({formatCurrency(data.budgetAlerts[0].spent)} / {formatCurrency(data.budgetAlerts[0].limit)}).
                    </p>
                  </div>
                </div>

                <Link href="/budgets" className="shrink-0">
                  <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-semibold text-xs flex items-center gap-1">
                    View Budget Warnings
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Net Balance Card */}
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                      Net Cumulative Balance
                    </span>
                    <div className={`p-2 rounded-xl border ${isPositiveNet ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}>
                      <Wallet className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-2xl sm:text-3xl font-bold font-mono ${isPositiveNet ? "text-emerald-400" : "text-rose-400"}`}>
                      {formatCurrency(netBalance, { showSign: true })}
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${isPositiveNet ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"}`}>
                      {isPositiveNet ? "Positive Net Cashflow" : "Deficit Net Balance"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Income Card */}
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                      Monthly Income
                    </span>
                    <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                      {formatCurrency(data.summary.monthlyIncome)}
                    </p>
                    <p className="text-xs text-[#94a3b8]">Current calendar month</p>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Expenses Card */}
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                      Monthly Expenses
                    </span>
                    <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                      <TrendingDown className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-rose-400">
                      {formatCurrency(data.summary.monthlyExpense)}
                    </p>
                    <p className="text-xs text-[#94a3b8]">Current calendar month</p>
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Savings Rate Card */}
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                      Savings Rate
                    </span>
                    <div className="p-2 rounded-xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8]">
                      <PiggyBank className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-2xl sm:text-3xl font-bold font-mono text-[#38bdf8]">
                      {data.summary.savingsRate}%
                    </p>
                    <p className="text-xs text-[#94a3b8]">Income retained after expenses</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Split Main Content Grid: Recent Transactions & Savings Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Transactions Feed (2 cols) */}
              <Card className="lg:col-span-2 bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-[#303539] pb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-[#38bdf8]" />
                      <h2 className="font-semibold text-lg text-[#dee3e8]">
                        Recent Transactions Ledger
                      </h2>
                    </div>
                    <Link
                      href="/transactions"
                      className="text-xs font-semibold text-[#38bdf8] hover:underline flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {data.recentTransactions.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#94a3b8]">
                      No transactions logged yet. Click "+ Add Transaction" to create your first record.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {data.recentTransactions.map((tx) => {
                        const isIncome = tx.type === "INCOME";
                        const dateFormatted = mounted
                          ? new Date(tx.transactionDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })
                          : "";

                        return (
                          <div
                            key={tx.id}
                            className="p-3.5 rounded-xl bg-[#22272b] border border-[#303539] flex items-center justify-between gap-4 hover:border-[#38bdf8]/30 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 border ${
                                  isIncome
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                    : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                }`}
                              >
                                {isIncome ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              </div>

                              <div className="min-w-0 space-y-0.5">
                                <p className="font-semibold text-sm text-[#dee3e8] truncate">
                                  {tx.merchantName}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-[#94a3b8]">
                                  <span className="px-2 py-0.5 rounded bg-[#161a1d] border border-[#303539] text-[11px]">
                                    {tx.category?.name || "Uncategorized"}
                                  </span>
                                  <span>•</span>
                                  <span>{dateFormatted}</span>
                                </div>
                              </div>
                            </div>

                            <span
                              className={`font-mono font-bold text-sm shrink-0 ${
                                isIncome ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Savings Goals Widget (1 col) */}
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl flex flex-col justify-between">
                <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#303539] pb-4">
                      <div className="flex items-center gap-2">
                        <PiggyBank className="w-5 h-5 text-emerald-400" />
                        <h2 className="font-semibold text-lg text-[#dee3e8]">
                          Active Savings Targets
                        </h2>
                      </div>
                      <Link
                        href="/savings"
                        className="text-xs font-semibold text-[#38bdf8] hover:underline flex items-center gap-1"
                      >
                        All Goals
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    {data.savingsSummary.topActiveGoals.length === 0 ? (
                      <div className="py-8 text-center text-xs text-[#94a3b8]">
                        No active savings targets. Set up a savings goal to start tracking progress.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data.savingsSummary.topActiveGoals.map((goal) => (
                          <div
                            key={goal.id}
                            className="p-3.5 rounded-xl bg-[#22272b] border border-[#303539] space-y-2.5"
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className="font-semibold text-sm text-[#dee3e8] line-clamp-1">
                                {goal.name}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 font-mono shrink-0">
                                {goal.percentage}%
                              </span>
                            </div>

                            <div className="flex justify-between items-baseline text-xs font-mono">
                              <span className="text-emerald-400 font-semibold">
                                {formatCurrency(goal.accumulatedBalance)}
                              </span>
                              <span className="text-[#94a3b8]">
                                / {formatCurrency(goal.targetAmount)}
                              </span>
                            </div>

                            <div className="w-full bg-[#161a1d] h-2 rounded-full overflow-hidden border border-[#303539]">
                              <div
                                className="bg-emerald-500 h-full transition-all duration-500"
                                style={{ width: `${Math.min(100, goal.percentage)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#303539]">
                    <Link href="/analytics" className="w-full">
                      <Button className="w-full bg-[#1b2024] hover:bg-[#22272b] text-[#dee3e8] border border-[#303539] text-xs font-semibold flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#38bdf8]" />
                        View Full Cashflow Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Quick Add Transaction Modal */}
      <AddEditTransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
