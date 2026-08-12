"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    setMounted(true);
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

  const filteredGoals = goals.filter((g) => {
    if (activeTab === "IN_PROGRESS") return g.status === "IN_PROGRESS";
    if (activeTab === "COMPLETED") return g.status === "COMPLETED";
    return true;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200 flex flex-col" suppressHydrationWarning>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-xl text-[#38bdf8]">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
                Savings Goals
              </h1>
            </div>
            <p className="text-sm text-[#94a3b8]">
              Set financial targets, record contributions, and track progress toward your goals.
            </p>
          </div>

          <Button
            onClick={handleOpenCreateModal}
            className="bg-[#38bdf8] hover:bg-[#0284c7] text-[#0f172a] font-semibold flex items-center gap-2 shadow-lg shadow-[#38bdf8]/10 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            New Savings Goal
          </Button>
        </div>

        {/* Overall Summary Health Card */}
        <Card className="bg-[#161a1d] border-[#303539] shadow-xl">
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Total Accumulated
                </span>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
                  {formatCurrency(summary.totalAccumulated)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Total Target Goals
                </span>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-[#dee3e8]">
                  {formatCurrency(summary.totalTarget)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Overall Completion
                </span>
                <p className="text-2xl sm:text-3xl font-bold font-mono text-[#38bdf8]">
                  {summary.overallPercentage}%
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                  Goal Status
                </span>
                <p className="text-sm font-medium text-[#dee3e8] pt-1">
                  <span className="text-amber-300 font-bold">{summary.completedCount}</span> Completed /{" "}
                  <span className="text-[#38bdf8] font-bold">{summary.inProgressCount}</span> Active
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 pt-2 border-t border-[#303539]">
              <div className="flex justify-between items-center text-xs font-medium">
                <span className="text-[#94a3b8]">Overall Savings Progress</span>
                <span className="font-mono text-[#dee3e8]">{summary.overallPercentage}%</span>
              </div>
              <div className="w-full bg-[#22272b] h-3 rounded-full overflow-hidden border border-[#303539]">
                <div
                  className={`h-full transition-all duration-500 ${
                    summary.overallPercentage >= 100
                      ? "bg-amber-400"
                      : "bg-[#38bdf8]"
                  }`}
                  style={{ width: `${Math.min(100, summary.overallPercentage)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tab Filters */}
        <div className="flex items-center justify-between border-b border-[#303539] pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "ALL"
                  ? "bg-[#38bdf8] text-[#0f172a]"
                  : "bg-[#1b2024] text-[#94a3b8] hover:text-[#dee3e8] border border-[#303539]"
              }`}
            >
              All Goals ({summary.totalCount})
            </button>
            <button
              onClick={() => setActiveTab("IN_PROGRESS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "IN_PROGRESS"
                  ? "bg-[#38bdf8] text-[#0f172a]"
                  : "bg-[#1b2024] text-[#94a3b8] hover:text-[#dee3e8] border border-[#303539]"
              }`}
            >
              In Progress ({summary.inProgressCount})
            </button>
            <button
              onClick={() => setActiveTab("COMPLETED")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "COMPLETED"
                  ? "bg-amber-400 text-[#0f172a]"
                  : "bg-[#1b2024] text-[#94a3b8] hover:text-[#dee3e8] border border-[#303539]"
              }`}
            >
              Completed ({summary.completedCount})
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#38bdf8] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#94a3b8]">Loading savings goals...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredGoals.length === 0 && (
          <Card className="bg-[#161a1d] border-[#303539]">
            <CardContent className="p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-[#22272b] border border-[#303539] rounded-2xl flex items-center justify-center mx-auto text-[#94a3b8]">
                <PiggyBank className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-lg font-bold text-[#dee3e8]">No Savings Goals Found</h3>
                <p className="text-xs text-[#94a3b8]">
                  {activeTab === "ALL"
                    ? "Start building your wealth by creating your first savings goal."
                    : `No goals matching filter '${activeTab}'.`}
                </p>
              </div>
              {activeTab === "ALL" && (
                <Button
                  onClick={handleOpenCreateModal}
                  className="bg-[#38bdf8] hover:bg-[#0284c7] text-[#0f172a] font-semibold"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Savings Goal
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Goals Cards Grid */}
        {!loading && !error && filteredGoals.length > 0 && (
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
                  className={`bg-[#161a1d] border-[#303539] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between ${
                    isCompleted ? "ring-1 ring-amber-500/30" : ""
                  }`}
                >
                  <CardContent className="p-6 space-y-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      {/* Title & Badges Header */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-lg text-[#dee3e8] leading-tight line-clamp-2">
                          {goal.name}
                        </h3>

                        {isCompleted ? (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                            <CheckCircle className="w-3.5 h-3.5" />
                            COMPLETED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#38bdf8]/10 text-[#38bdf8] border border-[#38bdf8]/20 shrink-0 font-mono">
                            {percentage}%
                          </span>
                        )}
                      </div>

                      {/* Amounts Display */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline">
                          <span className="text-2xl font-bold font-mono text-emerald-400">
                            {formatCurrency(goal.accumulatedBalance)}
                          </span>
                          <span className="text-xs font-mono text-[#94a3b8]">
                            / {formatCurrency(goal.targetAmount)}
                          </span>
                        </div>

                        {!isCompleted && (
                          <p className="text-xs text-amber-400/90 font-mono font-medium">
                            {formatCurrency(remaining)} remaining
                          </p>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="w-full bg-[#22272b] h-2.5 rounded-full overflow-hidden border border-[#303539]">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isCompleted ? "bg-amber-400" : "bg-emerald-500"
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Target Date */}
                      <div className="flex items-center gap-1.5 text-xs text-[#94a3b8] pt-1">
                        <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                        <span>Target: {targetDateFormatted}</span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-4 border-t border-[#303539] flex items-center justify-between gap-2 mt-4">
                      {!isCompleted ? (
                        <Button
                          onClick={() => handleOpenContributeModal(goal)}
                          size="sm"
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Funds
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-amber-300 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          Target Achieved!
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditModal(goal)}
                          className="h-8 w-8 text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b]"
                          title="Edit Goal"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDeleteModal(goal)}
                          className="h-8 w-8 text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10"
                          title="Delete Goal"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
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
