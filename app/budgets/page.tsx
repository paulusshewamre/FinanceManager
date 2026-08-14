"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PieChart,
  Plus,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Loader2,
  RefreshCw,
  Calendar,
  Sparkles,
  TrendingDown,
  Tag,
  RotateCcw,
} from "lucide-react";
import { AddEditBudgetModal, type BudgetItem, type CategoryItem } from "@/components/budgets/add-edit-budget-modal";
import { DeleteBudgetModal } from "@/components/budgets/delete-budget-modal";
import { useUserPreferences } from "@/lib/context/user-preferences-context";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BudgetsPage() {
  const { formatCurrency } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const now = useMemo(() => new Date(), []);
  const currentActualMonth = now.getUTCMonth() + 1;
  const currentActualYear = now.getUTCFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(currentActualMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentActualYear);

  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState({
    totalBudgeted: 0,
    totalSpent: 0,
    remaining: 0,
    overrun: 0,
    percentage: 0,
    status: "NORMAL" as "NORMAL" | "WARNING" | "EXCEEDED",
  });

  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetItem | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<BudgetItem | null>(null);

  const isCurrentMonthSelected = selectedMonth === currentActualMonth && selectedYear === currentActualYear;

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`);
      if (!res.ok) {
        throw new Error("Failed to fetch monthly category budgets");
      }
      const data = await res.json();
      setBudgets(data.budgets || []);
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading budgets");
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    setSelectedMonth(currentActualMonth);
    setSelectedYear(currentActualYear);
  };

  const getStatusIndicator = (status: "NORMAL" | "WARNING" | "EXCEEDED", percentage: number, overrun: number) => {
    if (status === "EXCEEDED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-destructive/10 border border-destructive/30 text-destructive flex items-center gap-1.5 shrink-0">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Exceeded (+{formatCurrency(overrun)})</span>
        </span>
      );
    }
    if (status === "WARNING") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1.5 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Warning ({percentage.toFixed(0)}%)</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>On Track ({percentage.toFixed(0)}%)</span>
      </span>
    );
  };

  const getProgressColor = (status: "NORMAL" | "WARNING" | "EXCEEDED") => {
    if (status === "EXCEEDED") return "bg-destructive";
    if (status === "WARNING") return "bg-amber-500";
    return "bg-emerald-500";
  };

  const isOverrun = summary.status === "EXCEEDED";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200" suppressHydrationWarning>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8" suppressHydrationWarning>
        {/* ========================================================================= */}
        {/* Header Banner & Month Navigation Controls */}
        {/* ========================================================================= */}
        <section aria-labelledby="budgets-header-title">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-card rounded-2xl border border-border shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
                  Budgeting & Threshold Engine
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • 80% Warning & 100%+ Over-Budget Alerts
                </span>
              </div>
              <h1 id="budgets-header-title" className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Monthly Budgets
              </h1>
              <p className="text-sm text-muted-foreground">
                Set category spending limits and monitor proactive threshold alerts for{" "}
                <span className="font-semibold text-foreground font-mono">
                  {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </span>.
              </p>
            </div>

            {/* Controls Bar: Month Navigator & Action Button */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Month Navigator */}
              <div className="flex items-center gap-1 p-1 bg-background rounded-xl border border-border shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevMonth}
                  className="h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  aria-label="View previous month budgets"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-2 text-xs font-bold text-foreground min-w-[110px] text-center font-mono flex items-center justify-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextMonth}
                  className="h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  aria-label="View next month budgets"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Reset to Current Month if viewing past/future */}
              {!isCurrentMonthSelected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetToCurrentMonth}
                  className="border-border bg-card hover:bg-muted text-xs text-muted-foreground hover:text-foreground min-h-[44px] sm:min-h-0"
                  aria-label="Jump to current month"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Current Month
                </Button>
              )}

              <Button
                onClick={() => {
                  setBudgetToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 py-2 flex items-center gap-2 min-h-[44px] shadow-lg shadow-primary/10 text-xs"
                aria-label="Configure new category budget limit"
              >
                <Plus className="w-4 h-4" />
                Set Category Budget
              </Button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Overall Monthly Budget Summary KPI Card */}
        {/* ========================================================================= */}
        <section aria-labelledby="overall-summary-title">
          <Card className="bg-card border-border text-card-foreground shadow-xl">
            <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60">
              <div>
                <CardTitle id="overall-summary-title" className="text-base font-bold text-foreground flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Overall Monthly Budget Summary ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Aggregated category limits vs total actual expenses for this calendar month.
                </CardDescription>
              </div>
              {getStatusIndicator(summary.status, summary.percentage, summary.overrun)}
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Budgeted */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                    Total Budgeted
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                    {formatCurrency(summary.totalBudgeted)}
                  </p>
                  <p className="text-xs text-muted-foreground">All category ceilings</p>
                </div>

                {/* 2. Total Spent */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                    Total Spent
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-primary tracking-tight">
                    {formatCurrency(summary.totalSpent)}
                  </p>
                  <p className="text-xs text-muted-foreground">Actual category outflows</p>
                </div>

                {/* 3. Remaining / Overrun */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                    {isOverrun ? "Total Overrun" : "Remaining Limit"}
                  </span>
                  <p
                    className={`text-xl sm:text-2xl font-bold font-mono tracking-tight ${
                      isOverrun
                        ? "text-destructive"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isOverrun ? `-${formatCurrency(summary.overrun)}` : `+${formatCurrency(summary.remaining)}`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOverrun ? "Exceeded budget ceiling" : "Available to spend"}
                  </p>
                </div>

                {/* 4. Budget Utilization */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-tight">
                    Budget Utilization
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                    {summary.percentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Of allocated budget cap</p>
                </div>
              </div>

              {/* Overall Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span className="font-medium">Budget Cap Progress</span>
                  <span className="font-mono font-semibold text-foreground">
                    {summary.percentage.toFixed(1)}% ({formatCurrency(summary.totalSpent)} / {formatCurrency(summary.totalBudgeted)})
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={Math.min(100, summary.percentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Overall budget utilization for ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}: ${summary.percentage.toFixed(1)}%`}
                  className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border"
                >
                  <div
                    className={`h-full transition-all duration-500 ${getProgressColor(summary.status)}`}
                    style={{ width: `${Math.min(100, summary.percentage)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* Loading / Error / Empty States / Populated Category Budgets Grid */}
        {/* ========================================================================= */}
        <section aria-labelledby="category-budgets-title">
          <h2 id="category-budgets-title" className="sr-only">
            Category Budget Ceilings
          </h2>

          {/* State 1: Loading State (Shimmer Skeletons) */}
          {isLoading ? (
            <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading monthly category budgets">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-60 rounded-2xl bg-card border border-border p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="h-5 w-32 bg-muted rounded" />
                        <div className="h-3 w-20 bg-muted rounded" />
                      </div>
                      <div className="h-6 w-24 bg-muted rounded-full" />
                    </div>
                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 w-16 bg-muted rounded" />
                        <div className="h-4 w-16 bg-muted rounded" />
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full" />
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="h-4 w-12 bg-muted rounded" />
                      <div className="h-8 w-16 bg-muted rounded-lg" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            /* State 2: Error State */
            <div
              role="alert"
              className="p-8 text-center bg-card rounded-2xl border border-destructive/30 text-destructive space-y-3 shadow-lg"
            >
              <AlertOctagon className="w-8 h-8 mx-auto text-destructive" />
              <h3 className="text-sm font-bold">Unable to Load Monthly Budgets</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchBudgets}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold mt-2"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry Loading
              </Button>
            </div>
          ) : budgets.length === 0 ? (
            /* State 3: Empty State */
            <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-xl space-y-4">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <PieChart className="w-7 h-7" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-base font-bold text-foreground">No Budgets Configured for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You haven&apos;t set any category spending limits for this month yet. Creating budget ceilings helps you track warning alerts before overspending.
                </p>
              </div>
              <Button
                onClick={() => {
                  setBudgetToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-xs px-5 py-2.5 min-h-[44px]"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Set Your First Budget
              </Button>
            </div>
          ) : (
            /* State 4: Populated Category Budgets Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {budgets.map((b) => (
                <Card
                  key={b.id}
                  className="bg-card border-border text-card-foreground hover:border-primary/40 transition-all shadow-xl flex flex-col justify-between group"
                >
                  <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0 gap-2">
                    <div className="space-y-1 min-w-0">
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {b.category.name}
                      </CardTitle>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Tag className="w-3 h-3 text-primary" />
                        <span>Expense Category</span>
                      </div>
                    </div>
                    {getStatusIndicator(b.status, b.percentage, b.overrun)}
                  </CardHeader>

                  <CardContent className="p-5 pt-2 space-y-4">
                    {/* Spent vs Limit Monospaced Display */}
                    <div className="flex justify-between items-baseline pt-2 border-t border-border/60">
                      <div className="space-y-0.5">
                        <span className="text-[11px] text-muted-foreground uppercase font-semibold">Spent</span>
                        <p className="text-lg font-bold font-mono text-foreground">
                          {formatCurrency(b.spent)}
                        </p>
                      </div>

                      <div className="space-y-0.5 text-right">
                        <span className="text-[11px] text-muted-foreground uppercase font-semibold">Spending Limit</span>
                        <p className="text-lg font-bold font-mono text-primary">
                          {formatCurrency(b.amount)}
                        </p>
                      </div>
                    </div>

                    {/* Category Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                        <span className="font-medium">
                          {b.status === "EXCEEDED"
                            ? `Over budget by ${formatCurrency(b.overrun)}`
                            : `${formatCurrency(b.remaining)} remaining`}
                        </span>
                        <span className="font-mono font-semibold text-foreground">{b.percentage.toFixed(0)}%</span>
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={Math.min(100, b.percentage)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Budget utilization for ${b.category.name}: ${b.percentage.toFixed(0)}%`}
                        className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border"
                      >
                        <div
                          className={`h-full transition-all duration-500 ${getProgressColor(b.status)}`}
                          style={{ width: `${Math.min(100, b.percentage)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>

                  {/* Footer Controls */}
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-2 text-xs text-muted-foreground">
                    <span className="text-[11px] font-mono">
                      {String(b.month).padStart(2, "0")}/{b.year}
                    </span>

                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setBudgetToEdit(b);
                          setIsAddModalOpen(true);
                        }}
                        className="h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] p-0 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg"
                        aria-label={`Edit budget limit for ${b.category.name}`}
                      >
                        <Edit2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setBudgetToDelete(b)}
                        className="h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        aria-label={`Delete budget for ${b.category.name}`}
                      >
                        <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add / Edit Budget Modal (Radix Primitive) */}
      <AddEditBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setBudgetToEdit(null);
        }}
        onSuccess={fetchBudgets}
        currentMonth={selectedMonth}
        currentYear={selectedYear}
        budgetToEdit={budgetToEdit}
        availableCategories={categories}
      />

      {/* Delete Budget Modal (ConfirmDialog Primitive) */}
      <DeleteBudgetModal
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onSuccess={fetchBudgets}
        budgetToDelete={budgetToDelete}
      />
    </div>
  );
}
