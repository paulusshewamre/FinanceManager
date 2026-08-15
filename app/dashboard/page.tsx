"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  RefreshCw,
  Target,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import { AddEditTransactionModal } from "@/components/transactions/add-edit-transaction-modal";
import { safeFetch } from "@/lib/api/safe-fetch";

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

  // Quick Add Transaction Modal State
  const [txModalOpen, setTxModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await safeFetch("/api/dashboard");
      if (!res.ok) {
        throw new Error("Failed to load dashboard financial overview");
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while loading dashboard metrics");
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
  const monthlyNet = data?.summary.monthlyNet || 0;
  const isPositiveMonthlyNet = monthlyNet >= 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8" suppressHydrationWarning>
        {/* ========================================================================= */}
        {/* Header & Quick Action Banner */}
        {/* ========================================================================= */}
        <section aria-labelledby="dashboard-header-title" suppressHydrationWarning>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-card rounded-2xl border border-border shadow-xl" suppressHydrationWarning>
            <div className="space-y-1" suppressHydrationWarning>
              <div className="flex items-center gap-2" suppressHydrationWarning>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                  Financial Overview
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • Real-time Cashflow & Budget Health
                </span>
              </div>
              <h1 id="dashboard-header-title" className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Welcome back, {displayName || session?.user?.name || "User"}!
              </h1>
              <p className="text-sm text-muted-foreground">
                Here is your complete 360° personal financial summary, budget warnings, and recent activity.
              </p>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0" suppressHydrationWarning>
              <Button
                onClick={() => setTxModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold flex items-center gap-1.5 shadow-lg shadow-primary/10 text-xs min-h-[44px] px-4"
                aria-label="Add new transaction"
              >
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
              <Link href="/budgets">
                <Button
                  variant="outline"
                  className="border-border bg-card hover:bg-muted text-foreground text-xs min-h-[44px]"
                >
                  <PieChart className="w-3.5 h-3.5 mr-1.5 text-primary" />
                  Budgets
                </Button>
              </Link>
              <Link href="/savings">
                <Button
                  variant="outline"
                  className="border-border bg-card hover:bg-muted text-foreground text-xs min-h-[44px]"
                >
                  <PiggyBank className="w-3.5 h-3.5 mr-1.5 text-emerald-500 dark:text-emerald-400" />
                  Savings
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Loading Skeleton State */}
        {/* ========================================================================= */}
        {loading && (
          <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading financial dashboard metrics" suppressHydrationWarning>
            {/* Top 4 Summary Cards Skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6" suppressHydrationWarning>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 rounded-2xl bg-card border border-border p-6 space-y-3" suppressHydrationWarning>
                  <div className="flex justify-between items-center" suppressHydrationWarning>
                    <div className="h-3 w-28 bg-muted rounded-md" suppressHydrationWarning />
                    <div className="h-8 w-8 bg-muted rounded-xl" suppressHydrationWarning />
                  </div>
                  <div className="h-8 w-36 bg-muted rounded-md" suppressHydrationWarning />
                  <div className="h-3 w-24 bg-muted rounded-md" suppressHydrationWarning />
                </div>
              ))}
            </div>

            {/* Split Content Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" suppressHydrationWarning>
              <div className="md:col-span-2 h-96 rounded-2xl bg-card border border-border p-6 space-y-4" suppressHydrationWarning>
                <div className="flex justify-between items-center pb-4 border-b border-border" suppressHydrationWarning>
                  <div className="h-5 w-48 bg-muted rounded-md" suppressHydrationWarning />
                  <div className="h-4 w-16 bg-muted rounded-md" suppressHydrationWarning />
                </div>
                <div className="space-y-3 pt-2" suppressHydrationWarning>
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-14 bg-muted/60 rounded-xl" suppressHydrationWarning />
                  ))}
                </div>
              </div>

              <div className="h-96 rounded-2xl bg-card border border-border p-6 space-y-4" suppressHydrationWarning>
                <div className="flex justify-between items-center pb-4 border-b border-border" suppressHydrationWarning>
                  <div className="h-5 w-40 bg-muted rounded-md" suppressHydrationWarning />
                  <div className="h-4 w-16 bg-muted rounded-md" suppressHydrationWarning />
                </div>
                <div className="space-y-3 pt-2" suppressHydrationWarning>
                  {[1, 2, 3].map((k) => (
                    <div key={k} className="h-20 bg-muted/60 rounded-xl" suppressHydrationWarning />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Error State */}
        {/* ========================================================================= */}
        {error && !loading && (
          <div
            role="alert"
            className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive space-y-3 text-center shadow-lg"
          >
            <AlertOctagon className="w-8 h-8 mx-auto text-destructive" />
            <h2 className="text-base font-bold">Unable to Load Dashboard</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">{error}</p>
            <Button
              onClick={fetchDashboardData}
              variant="outline"
              size="sm"
              className="border-destructive/30 text-destructive hover:bg-destructive/10 min-h-[40px] font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Main Dashboard Content */}
        {/* ========================================================================= */}
        {!loading && !error && data && (
          <div className="space-y-8">
            {/* --------------------------------------------------------------------- */}
            {/* Proactive Budget Alert Banners */}
            {/* --------------------------------------------------------------------- */}
            {data.budgetAlerts && data.budgetAlerts.length > 0 && (
              <section aria-labelledby="budget-alerts-title" className="space-y-3">
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0">
                      <AlertTriangle className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h2 id="budget-alerts-title" className="font-bold text-sm text-foreground">
                          Budget Limit Warning ({data.budgetAlerts.length} Active Alert{data.budgetAlerts.length > 1 ? "s" : ""})
                        </h2>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wide">
                          Action Recommended
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {data.budgetAlerts.map((a) => (
                          <span key={a.id} className="inline-block mr-3">
                            <span className="font-semibold text-foreground">{a.categoryName}</span>:{" "}
                            <span className={a.status === "EXCEEDED" ? "text-destructive font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                              {a.percentage}%
                            </span>{" "}
                            ({formatCurrency(a.spent)} / {formatCurrency(a.limit)})
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>

                  <Link href="/budgets" className="shrink-0 w-full sm:w-auto">
                    <Button
                      size="sm"
                      className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-500 dark:hover:bg-amber-600 dark:text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 min-h-[40px] shadow-sm"
                    >
                      <span>Adjust Budgets</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </section>
            )}

            {/* --------------------------------------------------------------------- */}
            {/* Top 4 Core Metrics Grid (3-Second Financial Comprehension) */}
            {/* --------------------------------------------------------------------- */}
            <section aria-labelledby="core-metrics-title">
              <h2 id="core-metrics-title" className="sr-only">
                Financial Key Performance Indicators
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {/* 1. Net Cumulative Balance (Primary Hero Card) */}
                <Card className="bg-card border-border shadow-xl hover:border-primary/40 transition-all group">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Net Cumulative Balance
                      </span>
                      <div
                        className={`p-2 rounded-xl border ${
                          isPositiveNet
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 border-destructive/20 text-destructive"
                        }`}
                      >
                        <Wallet className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p
                        className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${
                          isPositiveNet
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-destructive"
                        }`}
                      >
                        {formatCurrency(netBalance, { showSign: true })}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                            isPositiveNet
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              : "bg-destructive/10 text-destructive border border-destructive/20"
                          }`}
                        >
                          {isPositiveNet ? "+ Positive Surplus" : "- Net Deficit"}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">All-time</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Monthly Income Card */}
                <Card className="bg-card border-border shadow-xl hover:border-emerald-500/40 transition-all group">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Monthly Income
                      </span>
                      <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                        +{formatCurrency(data.summary.monthlyIncome)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>Current month cashflow</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Monthly Expenses Card */}
                <Card className="bg-card border-border shadow-xl hover:border-destructive/40 transition-all group">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Monthly Expenses
                      </span>
                      <div className="p-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
                        <TrendingDown className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-bold font-mono text-destructive tracking-tight">
                        -{formatCurrency(data.summary.monthlyExpense)}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span>Current month outflows</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* 4. Net Monthly Savings Rate Card */}
                <Card className="bg-card border-border shadow-xl hover:border-primary/40 transition-all group">
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Savings Rate
                      </span>
                      <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                        <PiggyBank className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-2xl sm:text-3xl font-bold font-mono text-primary tracking-tight">
                        {data.summary.savingsRate}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Net:{" "}
                        <span className={`font-mono font-semibold ${isPositiveMonthlyNet ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}`}>
                          {formatCurrency(monthlyNet, { showSign: true })}
                        </span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* --------------------------------------------------------------------- */}
            {/* Split Content Section: Recent Transactions & Active Savings Targets */}
            {/* --------------------------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Recent Transactions Feed (2 cols) */}
              <section aria-labelledby="recent-transactions-title" className="md:col-span-2">
                <Card className="bg-card border-border shadow-xl h-full flex flex-col justify-between">
                  <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          <h2 id="recent-transactions-title" className="font-bold text-lg text-foreground">
                            Recent Transactions Ledger
                          </h2>
                        </div>
                        <Link
                          href="/transactions"
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                        >
                          <span>View All</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Transactions List / Empty State */}
                      {data.recentTransactions.length === 0 ? (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border text-muted-foreground flex items-center justify-center mx-auto">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-foreground">No Transactions Logged Yet</h3>
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                              Your cashflow ledger is currently empty. Record your first transaction to view real-time spending insights.
                            </p>
                          </div>
                          <Button
                            onClick={() => setTxModalOpen(true)}
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs mt-2"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Log First Transaction
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
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
                                className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between gap-4 hover:border-primary/40 hover:bg-muted/70 transition-all group"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className={`p-2.5 rounded-xl shrink-0 border ${
                                      isIncome
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                        : "bg-destructive/10 border-destructive/20 text-destructive"
                                    }`}
                                  >
                                    {isIncome ? (
                                      <TrendingUp className="w-4 h-4" />
                                    ) : (
                                      <TrendingDown className="w-4 h-4" />
                                    )}
                                  </div>

                                  <div className="min-w-0 space-y-0.5">
                                    <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                      {tx.merchantName || "Unspecified Payee"}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <span className="px-2 py-0.5 rounded bg-card border border-border text-[11px] font-medium">
                                        {tx.category?.name || "Uncategorized"}
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 font-mono text-[11px]">
                                        <Clock className="w-3 h-3" />
                                        {dateFormatted}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span
                                    className={`font-mono font-bold text-sm ${
                                      isIncome
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : "text-destructive"
                                    }`}
                                  >
                                    {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                                  </span>
                                  <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                                    {tx.type}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                      <span>Showing {data.recentTransactions.length} most recent entries</span>
                      <Link
                        href="/transactions"
                        className="font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        Full Ledger
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>

              {/* Active Savings Targets Widget (1 col) */}
              <section aria-labelledby="savings-targets-title">
                <Card className="bg-card border-border shadow-xl h-full flex flex-col justify-between">
                  <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-border pb-4">
                        <div className="flex items-center gap-2">
                          <Target className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                          <h2 id="savings-targets-title" className="font-bold text-lg text-foreground">
                            Savings Targets
                          </h2>
                        </div>
                        <Link
                          href="/savings"
                          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                        >
                          <span>All Goals</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Savings Goals List / Empty State */}
                      {data.savingsSummary.topActiveGoals.length === 0 ? (
                        <div className="py-12 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                            <PiggyBank className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-sm font-bold text-foreground">No Savings Goals Active</h3>
                            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                              Set up a financial target (e.g. Emergency Fund, Vacation) to monitor your milestones.
                            </p>
                          </div>
                          <Link href="/savings">
                            <Button size="sm" variant="outline" className="text-xs font-semibold mt-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10">
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Create Savings Target
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3.5">
                          {data.savingsSummary.topActiveGoals.map((goal) => (
                            <div
                              key={goal.id}
                              className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2.5 hover:border-emerald-500/40 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-semibold text-sm text-foreground line-clamp-1">
                                  {goal.name}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono shrink-0">
                                  {goal.percentage}%
                                </span>
                              </div>

                              <div className="flex justify-between items-baseline text-xs font-mono">
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                  {formatCurrency(goal.accumulatedBalance)}
                                </span>
                                <span className="text-muted-foreground">
                                  / {formatCurrency(goal.targetAmount)}
                                </span>
                              </div>

                              {/* Visual Progress Track */}
                              <div
                                role="progressbar"
                                aria-valuenow={Math.min(100, goal.percentage)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`Savings progress for ${goal.name}: ${goal.percentage}%`}
                                className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border"
                              >
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

                    <div className="pt-4 border-t border-border">
                      <Link href="/analytics" className="w-full block">
                        <Button className="w-full bg-muted hover:bg-muted/80 text-foreground border border-border text-xs font-semibold flex items-center justify-center gap-2 min-h-[44px]">
                          <Sparkles className="w-4 h-4 text-primary" />
                          View Detailed Analytics
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Quick Add Transaction Modal (Uses Standardized Radix Dialog from UI-003) */}
      <AddEditTransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
