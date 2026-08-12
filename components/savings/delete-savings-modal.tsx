"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertOctagon } from "lucide-react";
import { SavingsGoal } from "./add-edit-savings-modal";

interface DeleteSavingsGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: SavingsGoal | null;
  onSuccess: () => void;
}

export function DeleteSavingsGoalModal({
  open,
  onOpenChange,
  goal,
  onSuccess,
}: DeleteSavingsGoalModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  const handleDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/savings/${goal.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete savings goal");
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
      <DialogContent className="sm:max-w-[420px] bg-[#161a1d] border-[#303539] text-[#dee3e8]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-[#dee3e8] text-xl font-semibold">
                Delete Savings Goal
              </DialogTitle>
              <DialogDescription className="text-[#94a3b8] text-xs">
                Permanently remove this savings goal from your dashboard.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div className="p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
            {error}
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-[#22272b] border border-[#303539] space-y-1">
          <p className="text-sm font-semibold text-[#dee3e8]">{goal.name}</p>
          <p className="text-xs text-[#94a3b8] font-mono">
            Saved: ${Number(goal.accumulatedBalance).toLocaleString("en-US", { minimumFractionDigits: 2 })} / Target: ${Number(goal.targetAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
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
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="bg-rose-500 hover:bg-rose-600 text-white font-semibold"
          >
            {loading ? "Deleting..." : "Delete Goal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
