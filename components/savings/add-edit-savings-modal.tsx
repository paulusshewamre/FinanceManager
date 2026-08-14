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
import { PiggyBank, Loader2 } from "lucide-react";
import { useUserPreferences } from "@/lib/context/user-preferences-context";

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  accumulatedBalance: number;
  targetDate: string | Date;
  status: "IN_PROGRESS" | "COMPLETED";
  percentage?: number;
  remaining?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface AddEditSavingsGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
  onSuccess: () => void;
}

export function AddEditSavingsGoalModal({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: AddEditSavingsGoalModalProps) {
  const { currencySymbol } = useUserPreferences();
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [accumulatedBalance, setAccumulatedBalance] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(String(goal.targetAmount));
      setAccumulatedBalance(String(goal.accumulatedBalance));
      
      const dateObj = new Date(goal.targetDate);
      if (!isNaN(dateObj.getTime())) {
        setTargetDate(dateObj.toISOString().split("T")[0]);
      } else {
        setTargetDate("");
      }
    } else {
      setName("");
      setTargetAmount("");
      setAccumulatedBalance("0");
      // Default target date 3 months in the future
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 3);
      setTargetDate(defaultDate.toISOString().split("T")[0]);
    }
    setError(null);
  }, [goal, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedTarget = parseFloat(targetAmount);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError("Target amount must be a number greater than 0");
      return;
    }

    const parsedAccumulated = parseFloat(accumulatedBalance || "0");
    if (isNaN(parsedAccumulated) || parsedAccumulated < 0) {
      setError("Accumulated balance cannot be negative");
      return;
    }

    if (!targetDate) {
      setError("Please select a target completion date");
      return;
    }

    const targetDateObj = new Date(targetDate);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    if (!goal && targetDateObj < today) {
      setError("Target date must be today or in the future");
      return;
    }

    setLoading(true);

    try {
      const isEditing = !!goal;
      const url = isEditing ? `/api/savings/${goal.id}` : "/api/savings";
      const method = isEditing ? "PUT" : "POST";

      const payload: any = {
        name: name.trim(),
        targetAmount: parsedTarget,
        targetDate: targetDateObj.toISOString(),
      };

      if (!isEditing) {
        payload.accumulatedBalance = parsedAccumulated;
      } else {
        payload.accumulatedBalance = parsedAccumulated;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        data = { error: `Server returned HTTP status ${res.status}` };
      }

      if (!res.ok) {
        throw new Error(data.error || "Failed to save savings goal");
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
            <div className="p-2 bg-primary/10 border border-primary/20 rounded-xl text-primary">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-xl font-bold">
                {goal ? "Edit Savings Goal" : "Create Savings Goal"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-0.5">
                {goal
                  ? "Update your savings target amount or completion date."
                  : "Define a financial target to track your savings progress over time."}
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

          <div className="space-y-1.5">
            <label htmlFor="goal-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Goal Title
            </label>
            <Input
              id="goal-name"
              placeholder="e.g. Emergency Fund, New Laptop, Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-background border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary min-h-[40px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="target-amount" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Target Amount ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                  {currencySymbol}
                </span>
                <Input
                  id="target-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="1000.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono focus-visible:ring-primary pl-8 min-h-[40px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="accumulated-balance" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Saved ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                  {currencySymbol}
                </span>
                <Input
                  id="accumulated-balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={accumulatedBalance}
                  onChange={(e) => setAccumulatedBalance(e.target.value)}
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground font-mono focus-visible:ring-primary pl-8 min-h-[40px]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="target-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Target Completion Date
            </label>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              className="bg-background border-border text-foreground focus-visible:ring-primary min-h-[40px]"
            />
          </div>

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
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : goal ? (
                "Update Goal"
              ) : (
                "Create Goal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
