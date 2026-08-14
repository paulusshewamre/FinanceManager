"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  PiggyBank,
  Plus,
  CheckCircle,
  Calendar,
  Pencil,
  Trash2,
  TrendingUp,
  Sparkles,
  ArrowRight,
  AlertOctagon,
  RefreshCw,
  Target,
  Clock,
} from "lucide-react";
import {
  AddEditSavingsGoalModal,
  SavingsGoal,
} from "@/components/savings/add-edit-savings-modal";
import { RecordContributionModal } from "@/components/savings/record-contribution-modal";
import { DeleteSavingsGoalModal } from "@/components/savings/delete-savings-modal";
import { useUserPreferences } from "@/lib/context/user-preferences-context";

interface SummaryData {
  totalTarget: number;
  totalAccumulated: number;
  overallPercentage: number;
  completedCount: number;
  inProgressCount: number;
  totalCount: number;
}

export default function SavingsPage() {
  const { formatCurrency } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalTarget: 0,
    totalAccumulated: 0,
    overallPercentage: 0,
    completedCount: 0,
    inProgressCount: 0,
    totalCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"ALL" | "IN_PROGRESS" | "COMPLETED">("ALL");

  // Modal states
  const [addEditModalOpen, setAddEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [goalForContribution, setGoalForContribution] = useState<SavingsGoal | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<SavingsGoal | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchSavingsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/savings");
      if (!res.ok) {
        throw new Error("Failed to fetch savings goals");
      }

      const data = await res.json();
      setGoals(data.goals || []);
      setSummary(
        data.summary || {
          totalTarget: 0,
          totalAccumulated: 0,
          overallPercentage: 0,
          completedCount: 0,
          inProgressCount: 0,
          totalCount: 0,
        }
      );
    } catch (err: any) {
      setError(err.message || "Failed to load savings goals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSavingsData();
  }, [fetchSavingsData]);

  const handleOpenCreateModal = () => {
    setSelectedGoal(null);
    setAddEditModalOpen(true);
  };

  const handleOpenEditModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setAddEditModalOpen(true);
  };

  const handleOpenContributeModal = (goal: SavingsGoal) => {
    setGoalForContribution(goal);
    setContributionModalOpen(true);
  };

  const handleOpenDeleteModal = (goal: SavingsGoal) => {
    setGoalToDelete(goal);
    setDeleteModalOpen(true);
  };

  const filteredGoals = useMemo(() => {
    return goals.filter((g) => {
      if (activeTab === "IN_PROGRESS") return g.status === "IN_PROGRESS";
      if (activeTab === "COMPLETED") return g.status === "COMPLETED";
      return true;
    });
  }, [goals, activeTab]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8" suppressHydrationWarning>
        {/* ========================================================================= */}
        {/* Top Header Banner & Primary CTA */}
        {/* ========================================================================= */}
        <section aria-labelledby="savings-header-title">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-card rounded-2xl border border-border shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
                  Wealth Building & Milestones
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • Target Funds & Contribution Tracking
                </span>
              </div>
              <h1 id="savings-header-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                Savings Goals
              </h1>
              <p className="text-sm text-muted-foreground">
                Define financial targets, record periodic contributions, and monitor milestone progress.
              </p>
            </div>

            <Button
              onClick={handleOpenCreateModal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2 shadow-lg shadow-primary/10 self-start sm:self-auto min-h-[44px] px-4 text-xs"
              aria-label="Create new savings target"
            >
              <Plus className="w-4 h-4" />
              New Savings Goal
            </Button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Overall Savings Summary KPI Card */}
        {/* ========================================================================= */}
        <section aria-labelledby="savings-summary-title">
          <Card className="bg-card border-border text-card-foreground shadow-xl">
            <CardHeader className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60">
              <div>
                <CardTitle id="savings-summary-title" className="text-base font-bold text-foreground flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  Overall Savings Progress & Targets
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Aggregated balance across all active and completed financial targets.
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono">
                  {summary.overallPercentage}% Achieved
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* 1. Total Accumulated */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Total Accumulated
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                    {formatCurrency(summary.totalAccumulated)}
                  </p>
                  <p className="text-xs text-muted-foreground">Funds currently saved</p>
                </div>

                {/* 2. Total Target Goals */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Total Target Goals
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-foreground tracking-tight">
                    {formatCurrency(summary.totalTarget)}
                  </p>
                  <p className="text-xs text-muted-foreground">All milestone ceilings</p>
                </div>

                {/* 3. Overall Completion */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Overall Completion
                  </span>
                  <p className="text-xl sm:text-2xl font-bold font-mono text-primary tracking-tight">
                    {summary.overallPercentage}%
                  </p>
                  <p className="text-xs text-muted-foreground">Target progress reached</p>
                </div>

                {/* 4. Goal Status Breakdown */}
                <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5 min-w-0 flex flex-col justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                    Milestone Status
                  </span>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-0.5">
                    <span className="text-lg sm:text-xl font-bold font-mono text-amber-500 dark:text-amber-400">
                      {summary.completedCount}{" "}
                      <span className="text-xs font-medium font-sans text-muted-foreground">Done</span>
                    </span>
                    <span className="text-xs text-muted-foreground/60">•</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-primary">
                      {summary.inProgressCount}{" "}
                      <span className="text-xs font-medium font-sans text-muted-foreground">Active</span>
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {summary.totalCount} total registered {summary.totalCount === 1 ? "goal" : "goals"}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-muted-foreground">Cumulative Target Progress</span>
                  <span className="font-mono text-foreground font-semibold">
                    {summary.overallPercentage}% ({formatCurrency(summary.totalAccumulated)} / {formatCurrency(summary.totalTarget)})
                  </span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={Math.min(100, summary.overallPercentage)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Overall savings progress: ${summary.overallPercentage}%`}
                  className="w-full bg-muted h-3 rounded-full overflow-hidden border border-border"
                >
                  <div
                    className={`h-full transition-all duration-500 ${
                      summary.overallPercentage >= 100
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* Tab Filters Toolbar */}
        {/* ========================================================================= */}
        <section aria-labelledby="savings-tabs-title">
          <h2 id="savings-tabs-title" className="sr-only">
            Savings Goals Filter Tabs
          </h2>
          <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-border">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
              }`}
              aria-selected={activeTab === "ALL"}
            >
              All Goals ({summary.totalCount})
            </button>
            <button
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === "IN_PROGRESS"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
              }`}
              aria-selected={activeTab === "IN_PROGRESS"}
            >
              In Progress ({summary.inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab("COMPLETED")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                activeTab === "COMPLETED"
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-card text-muted-foreground hover:text-foreground border border-border hover:bg-muted"
              }`}
              aria-selected={activeTab === "COMPLETED"}
            >
              Completed ({summary.completedCount})
            </button>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Loading / Error / Empty States / Populated Goals Grid */}
        {/* ========================================================================= */}
        <section aria-labelledby="savings-grid-title">
          <h2 id="savings-grid-title" className="sr-only">
            Active and Completed Savings Targets
          </h2>

          {/* State 1: Loading State (Shimmer Skeletons) */}
          {loading ? (
            <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading savings goals">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 rounded-2xl bg-card border border-border p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="h-5 w-36 bg-muted rounded" />
                      <div className="h-6 w-16 bg-muted rounded-full" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-7 w-28 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted rounded" />
                    </div>
                    <div className="h-2.5 w-full bg-muted rounded-full" />
                    <div className="flex justify-between items-center pt-4 border-t border-border">
                      <div className="h-8 w-24 bg-muted rounded-lg" />
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
              <h3 className="text-sm font-bold">Unable to Load Savings Goals</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={fetchSavingsData}
                className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold mt-2"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Retry Loading
              </Button>
            </div>
          ) : filteredGoals.length === 0 ? (
            /* State 3: Empty State */
            <div className="p-12 text-center bg-card rounded-2xl border border-border shadow-xl space-y-4">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <PiggyBank className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h3 className="text-base font-bold text-foreground">
                  {activeTab === "ALL"
                    ? "No Savings Goals Configured"
                    : `No Goals Found in '${activeTab === "IN_PROGRESS" ? "In Progress" : "Completed"}' Filter`}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeTab === "ALL"
                    ? "Start building financial security by setting up a dedicated target fund (e.g., Emergency Savings, Vacation, Car Fund)."
                    : "No savings targets currently match this filter state."}
                </p>
              </div>
              {activeTab === "ALL" && (
                <Button
                  onClick={handleOpenCreateModal}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-5 py-2.5 min-h-[44px]"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create First Savings Goal
                </Button>
              )}
            </div>
          ) : (
            /* State 4: Populated Savings Goal Cards Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGoals.map((goal) => {
                const isCompleted = goal.status === "COMPLETED";
                const percentage = goal.percentage ?? Math.min(100, Math.round((Number(goal.accumulatedBalance) / Number(goal.targetAmount)) * 100));
                const remaining = goal.remaining ?? Math.max(0, Number(goal.targetAmount) - Number(goal.accumulatedBalance));
                const targetDateFormatted = mounted
                  ? new Date(goal.targetDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "";

                return (
                  <Card
                    key={goal.id}
                    className={`bg-card border-border hover:border-primary/40 transition-all shadow-xl flex flex-col justify-between group ${
                      isCompleted ? "ring-1 ring-amber-500/30" : ""
                    }`}
                  >
                    <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Title & Badges Header */}
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="font-bold text-base text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                            {goal.name}
                          </h3>

                          {isCompleted ? (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                              <CheckCircle className="w-3.5 h-3.5" />
                              COMPLETED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20 shrink-0 font-mono">
                              {percentage}%
                            </span>
                          )}
                        </div>

                        {/* Amounts Monospaced Display */}
                        <div className="space-y-1 pt-1 border-t border-border/60">
                          <div className="flex justify-between items-baseline">
                            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                              {formatCurrency(goal.accumulatedBalance)}
                            </span>
                            <span className="text-xs font-mono text-muted-foreground">
                              / {formatCurrency(goal.targetAmount)}
                            </span>
                          </div>

                          {!isCompleted ? (
                            <p className="text-xs text-warning font-mono font-medium">
                              {formatCurrency(remaining)} remaining to reach goal
                            </p>
                          ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              100% Target Met!
                            </p>
                          )}
                        </div>

                        {/* Progress Bar with Accessible ARIA */}
                        <div className="space-y-1.5">
                          <div
                            role="progressbar"
                            aria-valuenow={Math.min(100, percentage)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Savings progress for ${goal.name}: ${percentage}%`}
                            className="w-full bg-muted h-2.5 rounded-full overflow-hidden border border-border"
                          >
                            <div
                              className={`h-full transition-all duration-500 ${
                                isCompleted ? "bg-amber-500" : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.min(100, percentage)}%` }}
                            />
                          </div>
                        </div>

                        {/* Target Date */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          <span>Target Date: {targetDateFormatted}</span>
                        </div>
                      </div>

                      {/* Card Actions Footer */}
                      <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-2 mt-4">
                        {!isCompleted ? (
                          <Button
                            onClick={() => handleOpenContributeModal(goal)}
                            size="sm"
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl"
                            aria-label={`Log contribution to ${goal.name}`}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Log Contribution
                          </Button>
                        ) : (
                          <span className="text-xs font-semibold text-amber-600 dark:text-amber-300 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            Target Achieved!
                          </span>
                        )}

                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditModal(goal)}
                            className="h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl"
                            aria-label={`Edit ${goal.name}`}
                          >
                            <Pencil className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteModal(goal)}
                            className="h-9 w-9 min-h-[44px] min-w-[44px] sm:min-h-[36px] sm:min-w-[36px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                            aria-label={`Delete ${goal.name}`}
                          >
                            <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Modals (Standardized Radix Dialog & ConfirmDialog Primitives from UI-003) */}
      <AddEditSavingsGoalModal
        open={addEditModalOpen}
        onOpenChange={setAddEditModalOpen}
        goal={selectedGoal}
        onSuccess={fetchSavingsData}
      />

      <RecordContributionModal
        open={contributionModalOpen}
        onOpenChange={setContributionModalOpen}
        goal={goalForContribution}
        onSuccess={fetchSavingsData}
      />

      <DeleteSavingsGoalModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        goal={goalToDelete}
        onSuccess={fetchSavingsData}
      />
    </div>
  );
}
