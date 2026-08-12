"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PiggyBank, Sparkles } from "lucide-react";
import { SavingsGoal } from "./add-edit-savings-modal";

interface RecordContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
  onSuccess: () => void;
}

export function RecordContributionModal({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: RecordContributionModalProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAmount("");
    setError(null);
  }, [open, goal]);

  if (!goal) return null;

  const currentAccumulated = Number(goal.accumulatedBalance);
  const targetAmount = Number(goal.targetAmount);
  const remaining = Math.max(0, targetAmount - currentAccumulated);

  const parsedContribution = parseFloat(amount || "0");
  const newAccumulated = isNaN(parsedContribution)
    ? currentAccumulated
    : currentAccumulated + parsedContribution;
  const newPercentage = targetAmount > 0
    ? Math.min(100, Math.round((newAccumulated / targetAmount) * 100))
    : 0;
  const willComplete = newAccumulated >= targetAmount;

  const handlePreset = (val: number) => {
    setAmount(String(val));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError("Contribution amount must be a number greater than 0");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/savings/${goal.id}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parsed }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to record contribution");
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] bg-[#161a1d] border-[#303539] text-[#dee3e8]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-[#dee3e8] text-xl font-semibold">
                Record Contribution
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] text-xs">
                Add funds towards <span className="font-semibold text-[#dee3e8]">{goal.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              {error}
            </div>
          )}

          {/* Goal Metrics Summary Box */}
          <div className="p-3.5 rounded-xl bg-[#22272b] border border-[#303539] space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Current Saved:</span>
              <span className="font-mono font-semibold text-emerald-400">
                ${currentAccumulated.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#94a3b8]">Target Goal:</span>
              <span className="font-mono font-medium text-[#dee3e8]">
                ${targetAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-[#303539]">
              <span className="text-[#94a3b8]">Remaining Target:</span>
              <span className="font-mono font-medium text-amber-400">
                ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
              Quick Add Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[25, 50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-[#22272b] hover:bg-[#38bdf8]/10 text-[#dee3e8] hover:text-[#38bdf8] border border-[#303539] hover:border-[#38bdf8]/30 transition-colors"
                >
                  +${preset}
                </button>
              ))}
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => handlePreset(remaining)}
                  className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-colors"
                >
                  Fill Remaining (${remaining.toFixed(2)})
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
              Contribution Amount ($)
            </label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 100.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="bg-[#22272b] border-[#303539] text-[#dee3e8] placeholder-[#64748b] font-mono text-base focus:border-[#38bdf8]"
            />
          </div>

          {/* Live Progress Preview */}
          {parsedContribution > 0 && (
            <div className="p-3 rounded-xl bg-[#1b2024] border border-[#303539] space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#94a3b8]">New Balance:</span>
                <span className="font-mono font-semibold text-emerald-400">
                  ${newAccumulated.toLocaleString("en-US", { minimumFractionDigits: 2 })} ({newPercentage}%)
                </span>
              </div>
              {willComplete && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 pt-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>This contribution completes your savings goal! 🎉</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-[#303539] gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#303539] bg-[#1b2024] hover:bg-[#22272b] text-[#94a3b8]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-[#0f172a] font-semibold"
            >
              {loading ? "Recording..." : "Record Contribution"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
