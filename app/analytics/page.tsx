"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  LineChart,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Sparkles,
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
  const [monthsCount, setMonthsCount] = useState<number>(6);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = useCallback(async (months: number) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/analytics?months=${months}`);
      if (!res.ok) {
        throw new Error("Failed to load analytics data");
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
  const categoryBreakdown = data?.categoryBreakdown || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const topCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  const totalTrendsIncome = monthlyTrends.reduce((acc, m) => acc + m.income, 0);
  const totalTrendsExpense = monthlyTrends.reduce((acc, m) => acc + m.expense, 0);
  const avgMonthlyExpense = monthlyTrends.length > 0 ? totalTrendsExpense / monthlyTrends.length : 0;
  const avgMonthlyIncome = monthlyTrends.length > 0 ? totalTrendsIncome / monthlyTrends.length : 0;

  // Max value for bar chart scaling
  const maxBarValue = Math.max(
    1,
    ...monthlyTrends.map((m) => Math.max(m.income, m.expense))
  );

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200 flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-xl text-[#38bdf8]">
                <LineChart className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Financial Analytics & Trends
              </h1>
            </div>
            <p className="text-sm text-[#94a3b8]">
              Analyze category spending distribution and historical cashflow trends over time.
            </p>
          </div>

          <div className="flex items-center gap-2 border border-[#303539] bg-[#161a1d] p-1 rounded-xl shrink-0">
            <button
              onClick={() => setMonthsCount(3)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                monthsCount === 3
                  ? "bg-[#38bdf8] text-[#0f172a]"
                  : "text-[#94a3b8] hover:text-[#dee3e8]"
              }`}
            >
              3 Months
            </button>
            <button
              onClick={() => setMonthsCount(6)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                monthsCount === 6
                  ? "bg-[#38bdf8] text-[#0f172a]"
                  : "text-[#94a3b8] hover:text-[#dee3e8]"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setMonthsCount(12)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                monthsCount === 12
                  ? "bg-[#38bdf8] text-[#0f172a]"
                  : "text-[#94a3b8] hover:text-[#dee3e8]"
              }`}
            >
              12 Months
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#94a3b8]">Computing financial analytics...</p>
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
            {/* Top Highlights Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Top Spending Category
                  </span>
                  <p className="text-xl font-bold text-[#dee3e8] truncate">
                    {topCategory ? topCategory.categoryName : "N/A"}
                  </p>
                  <p className="text-xs text-[#38bdf8] font-mono font-medium">
                    {topCategory ? `${formatCurrency(topCategory.amount)} (${topCategory.percentage}%)` : formatCurrency(0)}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Avg. Monthly Income
                  </span>
                  <p className="text-xl font-bold font-mono text-emerald-400">
                    {formatCurrency(avgMonthlyIncome)}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Based on past {monthsCount} months</p>
                </CardContent>
              </Card>

              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Avg. Monthly Expense
                  </span>
                  <p className="text-xl font-bold font-mono text-rose-400">
                    {formatCurrency(avgMonthlyExpense)}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Based on past {monthsCount} months</p>
                </CardContent>
              </Card>

              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                    Net Trend Cashflow
                  </span>
                  <p className={`text-xl font-bold font-mono ${totalTrendsIncome >= totalTrendsExpense ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatCurrency(totalTrendsIncome - totalTrendsExpense, { showSign: true })}
                  </p>
                  <p className="text-xs text-[#94a3b8]">Cumulative over period</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Spending Breakdown Donut Visualization */}
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#303539] pb-4">
                    <div className="flex items-center gap-2">
                      <PieIcon className="w-5 h-5 text-[#38bdf8]" />
                      <h2 className="font-semibold text-lg text-[#dee3e8]">
                        Category Expense Distribution
                      </h2>
                    </div>
                    <span className="text-xs text-[#94a3b8]">Current Month</span>
                  </div>

                  {categoryBreakdown.length === 0 ? (
                    <div className="py-16 text-center text-xs text-[#94a3b8]">
                      No expenses logged for the current month.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Legend List with Proportional Progress Bars */}
                      <div className="space-y-3">
                        {categoryBreakdown.map((item) => (
                          <div key={item.categoryId} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <div className="flex items-center gap-2">
                                <span
                                  className="w-3 h-3 rounded-full shrink-0"
                                  style={{ backgroundColor: item.color }}
                                />
                                <span className="font-semibold text-[#dee3e8]">
                                  {item.categoryName}
                                </span>
                              </div>
                              <div className="font-mono text-right">
                                <span className="text-[#dee3e8]">
                                  {formatCurrency(item.amount)}
                                </span>
                                <span className="text-[#94a3b8] text-[11px] ml-1.5">
                                  ({item.percentage}%)
                                </span>
                              </div>
                            </div>

                            <div className="w-full bg-[#22272b] h-2 rounded-full overflow-hidden border border-[#303539]">
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

              {/* Historical Income vs Expense Bar Chart */}
              <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-[#303539] pb-4">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#38bdf8]" />
                      <h2 className="font-semibold text-lg text-[#dee3e8]">
                        Cashflow Trend ({monthsCount} Months)
                      </h2>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[#94a3b8]">Income</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <span className="text-[#94a3b8]">Expense</span>
                      </div>
                    </div>
                  </div>

                  {monthlyTrends.length === 0 ? (
                    <div className="py-16 text-center text-xs text-[#94a3b8]">
                      No historical cashflow trends recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-4 pt-4">
                      {/* Bar Visualization Container */}
                      <div className="h-64 flex items-end justify-between gap-3 px-2 pt-6 border-b border-[#303539] pb-2">
                        {monthlyTrends.map((m) => {
                          const incomeHeight = Math.max(4, Math.round((m.income / maxBarValue) * 100));
                          const expenseHeight = Math.max(4, Math.round((m.expense / maxBarValue) * 100));

                          return (
                            <div
                              key={m.monthKey}
                              className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative"
                            >
                              {/* Hover Tooltip */}
                              <div className="opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity absolute -top-12 z-20 p-2 bg-[#0f1418] border border-[#303539] rounded-lg shadow-xl text-[11px] font-mono whitespace-nowrap text-center space-y-0.5">
                                <p className="font-bold text-[#dee3e8]">{m.monthLabel}</p>
                                <p className="text-emerald-400">+{formatCurrency(m.income)}</p>
                                <p className="text-rose-400">-{formatCurrency(m.expense)}</p>
                              </div>

                              {/* Bars Side by Side */}
                              <div className="w-full flex items-end justify-center gap-1.5 h-full">
                                {/* Income Bar */}
                                <div
                                  className="w-1/2 max-w-[20px] bg-emerald-500 hover:bg-emerald-400 rounded-t-sm transition-all"
                                  style={{ height: `${incomeHeight}%` }}
                                  title={`Income: ${formatCurrency(m.income)}`}
                                />
                                {/* Expense Bar */}
                                <div
                                  className="w-1/2 max-w-[20px] bg-rose-500 hover:bg-rose-400 rounded-t-sm transition-all"
                                  style={{ height: `${expenseHeight}%` }}
                                  title={`Expense: ${formatCurrency(m.expense)}`}
                                />
                              </div>

                              <span className="text-[11px] font-semibold text-[#94a3b8] truncate">
                                {m.shortLabel}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Net Trend Footer */}
                      <div className="flex justify-between items-center text-xs text-[#94a3b8]">
                        <span>Monthly Income vs Expense Trend</span>
                        <span className="font-mono text-[#dee3e8]">
                          Period Net: {formatCurrency(totalTrendsIncome - totalTrendsExpense, { showSign: true })}
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
