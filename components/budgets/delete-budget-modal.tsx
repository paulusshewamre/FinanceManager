"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import type { BudgetItem } from "./add-edit-budget-modal";

interface DeleteBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  budgetToDelete?: BudgetItem | null;
}

export function DeleteBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  budgetToDelete,
}: DeleteBudgetModalProps) {
  const { formatCurrency } = useUserPreferences();
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!budgetToDelete) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setServerError(null);

    try {
      const res = await fetch(`/api/budgets/${budgetToDelete.id}`, {
        method: "DELETE",
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || "Failed to delete budget");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setServerError(null);
          onClose();
        }
      }}
      title="Delete Monthly Budget"
      description={`Remove spending limit ceiling for category "${budgetToDelete.category.name}"`}
      variant="destructive"
      confirmText="Confirm Delete"
      cancelText="Cancel"
      loading={isDeleting}
      error={serverError}
      onConfirm={handleDelete}
      details={
        <div className="space-y-1.5">
          <p>
            Are you sure you want to remove the{" "}
            <span className="font-bold text-foreground font-mono">
              {formatCurrency(budgetToDelete.amount)}
            </span>{" "}
            budget ceiling for{" "}
            <span className="font-semibold text-primary">
              {budgetToDelete.category.name}
            </span>{" "}
            for month {budgetToDelete.month}/{budgetToDelete.year}?
          </p>
          <p className="text-[11px] text-muted-foreground">
            Note: This will not delete any transactions in this category.
          </p>
        </div>
      }
    />
  );
}
