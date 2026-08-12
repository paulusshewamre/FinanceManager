"use client";

import { useState } from "react";
import { Loader2, Trash2, AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  if (!isOpen || !budgetToDelete) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <Card className="w-full max-w-md bg-[#1b2024] border-[#303539] text-[#dee3e8] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl font-bold text-[#dee3e8]">
              Delete Monthly Budget
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#94a3b8]">
            Remove spending limit ceiling for category &quot;{budgetToDelete.category.name}&quot;
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {serverError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="p-4 rounded-xl bg-[#0f1418] border border-[#303539] space-y-2 text-xs text-[#94a3b8]">
            <p>
              Are you sure you want to remove the <span className="font-bold text-[#dee3e8]">${budgetToDelete.amount.toFixed(2)}</span> budget ceiling for <span className="font-semibold text-[#38bdf8]">{budgetToDelete.category.name}</span> for month {budgetToDelete.month}/{budgetToDelete.year}?
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              Note: This will not delete any transactions in this category.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="border-[#303539] bg-[#0f1418] text-[#dee3e8] hover:bg-[#22272b]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-rose-600 text-white hover:bg-rose-700 font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
