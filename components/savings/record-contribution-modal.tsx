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
import { PiggyBank, Sparkles, Loader2, Plus } from "lucide-react";
import { SavingsGoal } from "./add-edit-savings-modal";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import { safeFetch } from "@/lib/api/safe-fetch";

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
  const { formatCurrency, currencySymbol } = useUserPreferences();
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
      const res = await safeFetch(`/api/savings/${goal.id}/contribute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: parsed }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `Server returned HTTP status ${res.status}` };
      }

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
      <DialogContent className="sm:max-w-[460px] bg-card border-border text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-xl font-bold">
                Log Contribution
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                Add funds towards <span className="font-semibold text-foreground">{goal.name}</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="p-3 text-xs rounded-xl bg-destructive/10 border border-destructive/30 text-destructive font-medium">
              {error}
            </div>
          )}

          {/* Goal Metrics Summary Box */}
          <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Current Saved:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(currentAccumulated)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Target Goal:</span>
              <span className="font-mono font-medium text-foreground">
                {formatCurrency(targetAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1.5 border-t border-border/60">
              <span className="text-muted-foreground">Remaining Target:</span>
              <span className="font-mono font-semibold text-warning">
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quick Add Presets
            </label>
            <div className="flex flex-wrap gap-2">
              {[25, 50, 100, 250, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-muted/70 hover:bg-primary/10 text-foreground hover:text-primary border border-border hover:border-primary/30 transition-colors min-h-[36px]"
                >
                  +{currencySymbol}{preset}
                </button>
              ))}
              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => handlePreset(remaining)}
                  className="px-3 py-1.5 text-xs font-mono font-semibold rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 transition-colors min-h-[36px]"
                >
                  Fill Remaining ({formatCurrency(remaining)})
                </button>
              )}
            </div>
          </div>

          {/* Custom Contribution Amount Input */}
          <div className="space-y-1.5">
            <label htmlFor="contribution-amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contribution Amount ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                {currencySymbol}
              </span>
              <Input
                id="contribution-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono text-base focus-visible:ring-primary pl-8 min-h-[44px]"
              />
            </div>
          </div>

          {/* Live Progress Preview */}
          {parsedContribution > 0 && (
            <div className="p-3 rounded-xl bg-card border border-border/80 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">New Balance Preview:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(newAccumulated)} ({newPercentage}%)
                </span>
              </div>
              {willComplete && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-300 pt-1">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>This contribution completes your savings goal! 🎉</span>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-border gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Record Contribution
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
