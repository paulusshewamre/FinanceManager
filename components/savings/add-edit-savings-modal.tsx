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

      const data = await res.json();

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
      <DialogContent className="sm:max-w-[460px] bg-[#161a1d] border-[#303539] text-[#dee3e8]">
        <DialogHeader>
          <DialogTitle className="text-[#dee3e8] text-xl font-semibold">
            {goal ? "Edit Savings Goal" : "Create Savings Goal"}
          </DialogTitle>
          <DialogDescription className="text-[#94a3b8]">
            {goal
              ? "Update your savings target amount or completion date."
              : "Define a financial target to track your savings progress over time."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
              Goal Title
            </label>
            <Input
              placeholder="e.g. Emergency Fund, New Laptop, Vacation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-[#22272b] border-[#303539] text-[#dee3e8] placeholder-[#64748b] focus:border-[#38bdf8]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Target Amount ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="1000.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="bg-[#22272b] border-[#303539] text-[#dee3e8] placeholder-[#64748b] font-mono focus:border-[#38bdf8]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Current Saved ($)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={accumulatedBalance}
                onChange={(e) => setAccumulatedBalance(e.target.value)}
                className="bg-[#22272b] border-[#303539] text-[#dee3e8] placeholder-[#64748b] font-mono focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
              Target Completion Date
            </label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
              className="bg-[#22272b] border-[#303539] text-[#dee3e8] focus:border-[#38bdf8]"
            />
          </div>

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
              className="bg-[#38bdf8] hover:bg-[#0284c7] text-[#0f172a] font-semibold"
            >
              {loading ? "Saving..." : goal ? "Update Goal" : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
