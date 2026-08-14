"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  LineChart,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
  AlertOctagon,
  RefreshCw,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Tag,
  Plus,
} from "lucide-react";
import { useUserPreferences } from "@/lib/context/user-preferences-context";

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

interface MonthlyTrend {
  monthKey: string;
  monthLabel: string;
  shortLabel: string;
  income: number;
  expense: number;
  net: number;
}

interface AnalyticsData {
  monthsCount: number;
  totalExpenseCurrentMonth: number;
  categoryBreakdown: CategoryBreakdown[];
  monthlyTrends: MonthlyTrend[];
}

export default function AnalyticsPage() {
  const { formatCurrency } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAnalyticsData = useCallback(async (months: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/analytics?months=${months}`);
      if (!res.ok) {
        throw new Error("Failed to load financial analytics data");
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
    fetchAnalyticsData(monthsCount);
  }, [monthsCount, fetchAnalyticsData]);

  // Derived metrics for summary cards
  const categoryBreakdown = useMemo(() => data?.categoryBreakdown || [], [data]);
  const monthlyTrends = useMemo(() => data?.monthlyTrends || [], [data]);
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  const totalTrendsIncome = useMemo(
    () => monthlyTrends.reduce((acc, m) => acc + m.income, 0),
    [monthlyTrends]
  );
  const totalTrendsExpense = useMemo(
    () => monthlyTrends.reduce((acc, m) => acc + m.expense, 0),
    [monthlyTrends]
  );
  const netPeriodCashflow = totalTrendsIncome - totalTrendsExpense;
  const isNetPositive = netPeriodCashflow >= 0;

  const savingsRate = totalTrendsIncome > 0
    ? Math.max(0, Math.round(((totalTrendsIncome - totalTrendsExpense) / totalTrendsIncome) * 100))
    : 0;

  const avgMonthlyExpense = monthlyTrends.length > 0 ? totalTrendsExpense / monthlyTrends.length : 0;
  const avgMonthlyIncome = monthlyTrends.length > 0 ? totalTrendsIncome / monthlyTrends.length : 0;

  // Max value for bar chart scaling
  const maxBarValue = useMemo(() => {
    return Math.max(1, ...monthlyTrends.map((m) => Math.max(m.income, m.expense)));
  }, [monthlyTrends]);

  const hasAnyData = totalTrendsIncome > 0 || totalTrendsExpense > 0 || categoryBreakdown.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8" suppressHydrationWarning>
        {/* ========================================================================= */}
        {/* Top Header Banner & Period Filter Controls */}
        {/* ========================================================================= */}
        <section aria-labelledby="analytics-header-title">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-card rounded-2xl border border-border shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
                  Financial Intelligence
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • Spending Distribution & Cashflow Trends
                </span>
              </div>
              <h1 id="analytics-header-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Financial Analytics & Trends
              </h1>
              <p className="text-sm text-muted-foreground">
                Analyze category spending distribution and historical cashflow trends over time.
              </p>
            </div>

            {/* Period Selector Tabs (3M, 6M, 12M) */}
            <div className="flex items-center gap-1.5 border border-border bg-muted/40 p-1.5 rounded-2xl shrink-0 self-start sm:self-auto">
              {[
                { label: "3 Months", value: 3 },
                { label: "6 Months", value: 6 },
                { label: "12 Months", value: 12 },
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setMonthsCount(p.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all min-h-[38px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                    monthsCount === p.value
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                  aria-pressed={monthsCount === p.value}
                  aria-label={`Show analytics for past ${p.label}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Loading State (Shimmer Skeletons) */}
        {/* ========================================================================= */}
        {loading && (
          <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading analytics data">
            {/* KPI Grid Skeletons */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-card border border-border space-y-2 h-28">
                  <div className="h-4 w-28 bg-muted rounded" />
                  <div className="h-7 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>

            {/* Charts Grid Skeletons */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-96 rounded-2xl bg-card border border-border p-6 space-y-4">
                <div className="h-5 w-48 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="space-y-3 pt-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-10 bg-muted/60 rounded-xl" />
                  ))}
                </div>
              </div>

              <div className="h-96 rounded-2xl bg-card border border-border p-6 space-y-4">
                <div className="h-5 w-48 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-60 bg-muted/40 rounded-xl pt-12 flex items-end justify-between gap-2 p-4" />
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
            className="p-8 text-center bg-card rounded-2xl border border-destructive/30 text-destructive space-y-3 shadow-lg"
          >
            <AlertOctagon className="w-8 h-8 mx-auto text-destructive" />
            <h2 className="text-sm font-bold">Unable to Load Financial Analytics</h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => fetchAnalyticsData(monthsCount)}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold mt-2 min-h-[40px]"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry Loading
            </Button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Account Empty State (When no transactions exist across all months) */}
        {/* ========================================================================= */}
        {!loading && !error && data && !hasAnyData && (
          <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-xl space-y-4">
            <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <LineChart className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h2 className="text-base font-bold text-foreground">No Financial Activity Recorded</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Analytics become active once transactions and cashflows are logged in your ledger. Log your first income or expense to unlock insights.
              </p>
            </div>
            <Link href="/transactions">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-5 py-2.5 min-h-[44px]">
                <Plus className="w-4 h-4 mr-1.5" />
                Log First Transaction
              </Button>
            </Link>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Main Analytics Dashboard Content (Populated State) */}
        {/* ========================================================================= */}
        {!loading && !error && data && hasAnyData && (
          <div className="space-y-8">
            {/* --------------------------------------------------------------------- */}
            {/* Primary KPI Summary (4-Card Metric Grid) */}
            {/* --------------------------------------------------------------------- */}
            <section aria-labelledby="analytics-kpi-title">
              <h2 id="analytics-kpi-title" className="sr-only">
                Period Summary Metrics
              </h2>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Period Income */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 min-w-0 flex flex-col justify-between shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Total Period Income
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                    +{formatCurrency(totalTrendsIncome)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Avg {formatCurrency(avgMonthlyIncome)}/mo</span>
                  </p>
                </div>

                {/* 2. Total Period Expenses */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 min-w-0 flex flex-col justify-between shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Total Period Expenses
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-destructive tracking-tight">
                    -{formatCurrency(totalTrendsExpense)}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingDown className="w-3.5 h-3.5 text-destructive shrink-0" />
                    <span>Avg {formatCurrency(avgMonthlyExpense)}/mo</span>
                  </p>
                </div>

                {/* 3. Net Period Cashflow */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 min-w-0 flex flex-col justify-between shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Net Cashflow
                  </span>
                  <p
                    className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                      isNetPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                    }`}
                  >
                    {formatCurrency(netPeriodCashflow, { showSign: true })}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {isNetPositive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Surplus
                      </span>
                    ) : (
                      <span className="text-destructive font-semibold flex items-center gap-0.5">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        Deficit
                      </span>
                    )}
                    <span>• {monthsCount} mo period</span>
                  </p>
                </div>

                {/* 4. Savings Rate or Top Spending Category */}
                <div className="p-4 rounded-xl bg-card border border-border space-y-1.5 min-w-0 flex flex-col justify-between shadow-md">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Savings Rate
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-primary tracking-tight">
                    {savingsRate}%
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Of total period inflows saved</span>
                  </p>
                </div>
              </div>
            </section>

            {/* --------------------------------------------------------------------- */}
            {/* Visual Charts Grid (Category Spending + Cashflow Trends) */}
            {/* --------------------------------------------------------------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Category Expense Distribution */}
              <Card className="bg-card border-border shadow-xl flex flex-col justify-between">
                <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-primary" />
                      Category Expense Distribution
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Current month category spending allocation and percentage share.
                    </CardDescription>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-muted border border-border text-muted-foreground self-start sm:self-auto font-mono">
                    {data.totalExpenseCurrentMonth > 0 ? formatCurrency(data.totalExpenseCurrentMonth) : "0 Total"}
                  </span>
                </CardHeader>

                <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  {categoryBreakdown.length === 0 ? (
                    <div className="py-16 text-center text-xs text-muted-foreground space-y-2">
                      <Tag className="w-8 h-8 mx-auto text-muted-foreground/50" />
                      <p>No expenses logged for the current month yet.</p>
                      <Link href="/transactions">
                        <Button variant="outline" size="sm" className="text-xs mt-2 border-border">
                          Log an Expense
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Segmented Visual Multi-Color Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                          <span className="font-medium">Expense Share Breakdown</span>
                          <span className="font-mono text-foreground font-semibold">
                            {categoryBreakdown.length} Categories
                          </span>
                        </div>

                        <div
                          role="img"
                          aria-label="Category expense distribution bar chart"
                          className="w-full h-3.5 bg-muted rounded-full overflow-hidden flex border border-border p-0.5 gap-0.5"
                        >
                          {categoryBreakdown.map((item) => (
                            <div
                              key={item.categoryId}
                              style={{
                                width: `${Math.max(2, item.percentage)}%`,
                                backgroundColor: item.color,
                              }}
                              className="h-full rounded-xs transition-all duration-500 first:rounded-l-full last:rounded-r-full"
                              title={`${item.categoryName}: ${formatCurrency(item.amount)} (${item.percentage}%)`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Accessible Data Table representation (Screen Readers) */}
                      <table className="sr-only">
                        <caption>Current month category expense distribution</caption>
                        <thead>
                          <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Percentage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categoryBreakdown.map((item) => (
                            <tr key={item.categoryId}>
                              <td>{item.categoryName}</td>
                              <td>{formatCurrency(item.amount)}</td>
                              <td>{item.percentage}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Proportional Category List with Individual Progress Tracks */}
                      <div className="space-y-3.5">
                        {categoryBreakdown.map((item) => (
                          <div key={item.categoryId} className="space-y-1.5 group">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                                  style={{ backgroundColor: item.color }}
                                  aria-hidden="true"
                                />
                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="font-mono text-right flex items-center gap-1.5">
                                <span className="text-foreground font-bold">
                                  {formatCurrency(item.amount)}
                                </span>
                                <span className="px-1.5 py-0.2 rounded text-[11px] font-semibold bg-muted text-muted-foreground">
                                  {item.percentage}%
                                </span>
                              </div>
                            </div>

                            <div
                              role="progressbar"
                              aria-valuenow={item.percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${item.categoryName} spending: ${item.percentage}% of total expenses`}
                              className="w-full bg-muted h-2 rounded-full overflow-hidden border border-border/60"
                            >
                              <div
                                className="h-full transition-all duration-500 rounded-full"
                                style={{
                                  width: `${Math.min(100, item.percentage)}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Chart 2: Historical Income vs Expense Cashflow Trend */}
              <Card className="bg-card border-border shadow-xl flex flex-col justify-between">
                <CardHeader className="p-6 pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      Cashflow Trend ({monthsCount} Months)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Monthly side-by-side comparison of total income vs. total expenses.
                    </CardDescription>
                  </div>

                  {/* Dual-Coded Legend */}
                  <div className="flex items-center gap-3 text-xs self-start sm:self-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                      <span className="text-muted-foreground font-medium">Income (+)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" aria-hidden="true" />
                      <span className="text-muted-foreground font-medium">Expense (-)</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6 flex-1 flex flex-col justify-between">
                  {monthlyTrends.length === 0 ? (
                    <div className="py-16 text-center text-xs text-muted-foreground">
                      No historical cashflow trends recorded for this period.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Accessible Screen-Reader Summary Table */}
                      <table className="sr-only">
                        <caption>Historical cashflow trends by month</caption>
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Income</th>
                            <th>Expense</th>
                            <th>Net Cashflow</th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthlyTrends.map((m) => (
                            <tr key={m.monthKey}>
                              <td>{m.monthLabel}</td>
                              <td>{formatCurrency(m.income)}</td>
                              <td>{formatCurrency(m.expense)}</td>
                              <td>{formatCurrency(m.net, { showSign: true })}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      {/* Bar Visualization Container */}
                      <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 pt-8 border-b border-border/80 pb-3">
                        {monthlyTrends.map((m) => {
                          const incomeHeight = Math.max(4, Math.round((m.income / maxBarValue) * 100));
                          const expenseHeight = Math.max(4, Math.round((m.expense / maxBarValue) * 100));
                          const isMonthPositive = m.net >= 0;

                          return (
                            <div
                              key={m.monthKey}
                              className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                            >
                              {/* Hover & Touch Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 pointer-events-none transition-opacity absolute -top-14 z-30 p-2.5 bg-popover border border-border rounded-xl shadow-2xl text-[11px] font-mono whitespace-nowrap text-center space-y-0.5">
                                <p className="font-bold text-popover-foreground">{m.monthLabel}</p>
                                <p className="text-emerald-600 dark:text-emerald-400">+{formatCurrency(m.income)}</p>
                                <p className="text-destructive">-{formatCurrency(m.expense)}</p>
                                <p className={`pt-0.5 border-t border-border font-bold ${isMonthPositive ? "text-emerald-500" : "text-destructive"}`}>
                                  Net: {formatCurrency(m.net, { showSign: true })}
                                </p>
                              </div>

                              {/* Bars Side by Side */}
                              <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                                {/* Income Bar */}
                                <div
                                  className="w-1/2 max-w-[24px] bg-emerald-500 hover:bg-emerald-400 rounded-t-md transition-all duration-300 shadow-sm"
                                  style={{ height: `${incomeHeight}%` }}
                                  aria-label={`${m.monthLabel} Income: ${formatCurrency(m.income)}`}
                                />
                                {/* Expense Bar */}
                                <div
                                  className="w-1/2 max-w-[24px] bg-rose-500 hover:bg-rose-400 rounded-t-md transition-all duration-300 shadow-sm"
                                  style={{ height: `${expenseHeight}%` }}
                                  aria-label={`${m.monthLabel} Expense: ${formatCurrency(m.expense)}`}
                                />
                              </div>

                              {/* X-Axis Label */}
                              <span className="text-[11px] font-semibold text-muted-foreground truncate group-hover:text-foreground transition-colors font-mono">
                                {m.shortLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Cumulative Trend Footer */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-muted-foreground gap-2 pt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>Historical {monthsCount}-Month Balance</span>
                        </span>
                        <span className="font-mono text-foreground font-semibold">
                          Period Net:{" "}
                          <span className={isNetPositive ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                            {formatCurrency(netPeriodCashflow, { showSign: true })}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
