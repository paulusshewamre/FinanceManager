"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
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
  const { formatCurrency } = useUserPreferences();
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
    <ConfirmDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setError(null);
        onOpenChange(nextOpen);
      }}
      title="Delete Savings Goal"
      description={`Permanently remove "${goal.name}" from your active financial targets.`}
      variant="destructive"
      confirmText="Delete Goal"
      cancelText="Cancel"
      loading={loading}
      error={error}
      onConfirm={handleDelete}
      details={
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-foreground">{goal.name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            Accumulated: {formatCurrency(goal.accumulatedBalance)} / Target: {formatCurrency(goal.targetAmount)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            Note: Deleting this target will remove its progress tracking.
          </p>
        </div>
      }
    />
  );
}
