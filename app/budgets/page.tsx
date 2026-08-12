"use client";

import { useState, useEffect, useCallback } from "react";
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
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AddEditBudgetModal, type BudgetItem, type CategoryItem } from "@/components/budgets/add-edit-budget-modal";
import { DeleteBudgetModal } from "@/components/budgets/delete-budget-modal";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function BudgetsPage() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getUTCMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(now.getUTCFullYear());

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
        throw new Error("Failed to fetch monthly budgets");
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

  const getStatusIndicator = (status: "NORMAL" | "WARNING" | "EXCEEDED", percentage: number, overrun: number) => {
    if (status === "EXCEEDED") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center gap-1.5 shrink-0">
          <AlertOctagon className="w-3.5 h-3.5" />
          Exceeded (+${overrun.toFixed(2)})
        </span>
      );
    }
    if (status === "WARNING") {
      return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center gap-1.5 shrink-0">
          <AlertTriangle className="w-3.5 h-3.5" />
          Warning ({percentage.toFixed(0)}%)
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 shrink-0">
        <CheckCircle2 className="w-3.5 h-3.5" />
        On Track ({percentage.toFixed(0)}%)
      </span>
    );
  };

  const getProgressColor = (status: "NORMAL" | "WARNING" | "EXCEEDED") => {
    if (status === "EXCEEDED") return "bg-rose-500";
    if (status === "WARNING") return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="min-h-screen bg-[#0f1418] text-[#dee3e8]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner & Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#1b2024] rounded-2xl border border-[#303539] shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8]">
                Monthly Spending Ceilings & Threshold Warning Engine
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#dee3e8] tracking-tight">
              Monthly Budgets
            </h1>
            <p className="text-sm text-[#94a3b8]">
              Set expense category spending limits and monitor 80% warning alerts and 100%+ overrun alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Month Navigator */}
            <div className="flex items-center gap-1 p-1 bg-[#0f1418] rounded-xl border border-[#303539]">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="h-8 w-8 p-0 text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b]"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 text-xs font-bold text-[#dee3e8] min-w-[110px] text-center font-mono">
                {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="h-8 w-8 p-0 text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b]"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={() => {
                setBudgetToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Set Category Budget
            </Button>
          </div>
        </div>

        {/* Overall Health Summary Card */}
        <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8] shadow-lg">
          <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#303539]/60">
            <div>
              <CardTitle className="text-base font-bold text-[#dee3e8] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#38bdf8]" />
                Overall Monthly Budget Summary ({MONTH_NAMES[selectedMonth - 1]} {selectedYear})
              </CardTitle>
              <CardDescription className="text-xs text-[#94a3b8]">
                Aggregated category limits vs total actual expenses for this calendar month.
              </CardDescription>
            </div>
            {getStatusIndicator(summary.status, summary.percentage, summary.overrun)}
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-[#0f1418] border border-[#303539] space-y-1">
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Total Budgeted</span>
                <p className="text-xl font-bold font-mono text-[#dee3e8]">
                  ${summary.totalBudgeted.toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0f1418] border border-[#303539] space-y-1">
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Total Spent</span>
                <p className="text-xl font-bold font-mono text-[#38bdf8]">
                  ${summary.totalSpent.toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0f1418] border border-[#303539] space-y-1">
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Remaining</span>
                <p className="text-xl font-bold font-mono text-emerald-400">
                  ${summary.remaining.toFixed(2)}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0f1418] border border-[#303539] space-y-1">
                <span className="text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">Budget Used</span>
                <p className="text-xl font-bold font-mono text-[#dee3e8]">
                  {summary.percentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-[#94a3b8]">
                <span>Progress to Cap</span>
                <span className="font-mono">{summary.percentage.toFixed(1)}% of Total Budget</span>
              </div>
              <Progress
                value={Math.min(100, summary.percentage)}
                indicatorClassName={getProgressColor(summary.status)}
                className="h-3 bg-[#0f1418] border border-[#303539]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Loading / Error / Empty States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#1b2024]/50 rounded-2xl border border-[#303539]">
            <Loader2 className="w-8 h-8 animate-spin text-[#38bdf8]" />
            <p className="text-xs text-[#94a3b8]">Loading monthly category budgets...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchBudgets} className="border-rose-500/30 text-rose-300">
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry
            </Button>
          </div>
        ) : budgets.length === 0 ? (
          <div className="p-12 text-center bg-[#1b2024] rounded-2xl border border-[#303539] space-y-4">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8] flex items-center justify-center">
              <PieChart className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-[#dee3e8]">No Budgets Configured</h3>
              <p className="text-xs text-[#94a3b8]">
                You haven&apos;t set any category budget limits for {MONTH_NAMES[selectedMonth - 1]} {selectedYear} yet.
              </p>
            </div>
            <Button
              onClick={() => {
                setBudgetToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold text-xs px-4 py-2"
            >
              Set Your First Budget
            </Button>
          </div>
        ) : (
          /* Category Budgets Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((b) => (
              <Card
                key={b.id}
                className="bg-[#1b2024] border-[#303539] text-[#dee3e8] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between"
              >
                <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-[#dee3e8] hover:text-[#38bdf8] transition-colors">
                      {b.category.name}
                    </CardTitle>
                    <p className="text-xs text-[#94a3b8]">
                      Expense Category
                    </p>
                  </div>
                  {getStatusIndicator(b.status, b.percentage, b.overrun)}
                </CardHeader>

                <CardContent className="p-5 pt-2 space-y-4">
                  {/* Spent vs Limit Monospaced Display */}
                  <div className="flex justify-between items-baseline pt-2 border-t border-[#303539]/60">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-[#94a3b8] uppercase font-semibold">Spent</span>
                      <p className="text-lg font-bold font-mono text-[#dee3e8]">
                        ${b.spent.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-0.5 text-right">
                      <span className="text-[11px] text-[#94a3b8] uppercase font-semibold">Spending Limit</span>
                      <p className="text-lg font-bold font-mono text-[#38bdf8]">
                        ${b.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Category Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px] text-[#94a3b8]">
                      <span>
                        {b.status === "EXCEEDED"
                          ? `Over budget by $${b.overrun.toFixed(2)}`
                          : `$${b.remaining.toFixed(2)} remaining`}
                      </span>
                      <span className="font-mono font-semibold text-[#dee3e8]">{b.percentage.toFixed(0)}%</span>
                    </div>
                    <Progress
                      value={Math.min(100, b.percentage)}
                      indicatorClassName={getProgressColor(b.status)}
                      className="h-2 bg-[#0f1418] border border-[#303539]"
                    />
                  </div>
                </CardContent>

                {/* Footer Controls */}
                <div className="p-4 pt-0 flex items-center justify-between border-t border-[#303539]/40 mt-2 text-xs text-[#94a3b8]">
                  <span className="text-[11px]">
                    {b.month}/{b.year}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setBudgetToEdit(b);
                        setIsAddModalOpen(true);
                      }}
                      className="h-7 w-7 p-0 text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#22272b]"
                      title="Edit budget limit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setBudgetToDelete(b)}
                      className="h-7 w-7 p-0 text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Budget Modal */}
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

      {/* Delete Budget Modal */}
      <DeleteBudgetModal
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onSuccess={fetchBudgets}
        budgetToDelete={budgetToDelete}
      />
    </div>
  );
}
