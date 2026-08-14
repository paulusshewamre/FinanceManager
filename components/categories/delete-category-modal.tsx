"use client";

import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export interface CategoryItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  isSystemDefault: boolean;
}

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToDelete: CategoryItem | null;
  availableCategories: CategoryItem[];
}

export function DeleteCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToDelete,
  availableCategories,
}: DeleteCategoryModalProps) {
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter available target categories matching same type, excluding category being deleted
  const compatibleCategories = availableCategories.filter(
    (c) => c.id !== categoryToDelete?.id && c.type === categoryToDelete?.type
  );

  useEffect(() => {
    if (categoryToDelete && compatibleCategories.length > 0) {
      // Default to "Uncategorized" category if available
      const uncategorized = compatibleCategories.find((c) =>
        c.name.toLowerCase().includes("uncategorized")
      );
      setTargetCategoryId(uncategorized ? uncategorized.id : compatibleCategories[0].id);
    }
    setServerError(null);
  }, [categoryToDelete, isOpen]);

  if (!categoryToDelete) return null;

  const handleDelete = async () => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Execute deletion with reassignment query parameter if target selected
      const url = targetCategoryId
        ? `/api/categories/${categoryToDelete.id}?reassignTo=${targetCategoryId}`
        : `/api/categories/${categoryToDelete.id}`;

      const res = await fetch(url, {
        method: "DELETE",
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || "Failed to delete category");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "An error occurred during deletion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setServerError(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-destructive/10 rounded-xl border border-destructive/20 text-destructive">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Delete Custom Category
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Are you sure you want to delete <span className="font-semibold text-destructive">&quot;{categoryToDelete.name}&quot;</span>?
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-background border border-border space-y-2 text-xs">
            <div className="flex items-center gap-2 text-warning font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Transaction Reassignment Policy (BR-013)</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              If this category has active transactions, they will automatically be reassigned to the target category selected below before deletion.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
              Reassign Transactions To
            </label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground focus:border-primary outline-none"
            >
              {compatibleCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.isSystemDefault ? "(Default)" : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-border bg-background text-foreground hover:bg-muted font-medium"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Confirm & Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
