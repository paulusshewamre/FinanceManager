"use client";

import { useState, useEffect, useId } from "react";
import { Trash2, AlertTriangle, Loader2, ArrowRightLeft, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { safeFetch } from "@/lib/api/safe-fetch";

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
  const selectId = useId();

  // Filter available target categories matching same type, excluding category being deleted
  const compatibleCategories = availableCategories.filter(
    (c) => c.id !== categoryToDelete?.id && c.type === categoryToDelete?.type
  );

  useEffect(() => {
    if (categoryToDelete && compatibleCategories.length > 0) {
      // Default to "Uncategorized" or "General" / "Other" category if available, otherwise first option
      const preferredDefault =
        compatibleCategories.find((c) =>
          c.name.toLowerCase().includes("uncategorized")
        ) ||
        compatibleCategories.find((c) =>
          c.name.toLowerCase().includes("other") || c.name.toLowerCase().includes("general")
        ) ||
        compatibleCategories[0];

      setTargetCategoryId(preferredDefault ? preferredDefault.id : "");
    } else {
      setTargetCategoryId("");
    }
    setServerError(null);
  }, [categoryToDelete, isOpen, availableCategories]);

  if (!categoryToDelete) return null;

  const handleDelete = async () => {
    setServerError(null);
    setIsSubmitting(true);

    try {
      // Execute deletion with reassignment query parameter if target selected
      const url = targetCategoryId
        ? `/api/categories/${categoryToDelete.id}?reassignTo=${encodeURIComponent(targetCategoryId)}`
        : `/api/categories/${categoryToDelete.id}`;

      const res = await safeFetch(url, {
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
      setServerError(err.message || "An error occurred during category deletion");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTarget = compatibleCategories.find((c) => c.id === targetCategoryId);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          setServerError(null);
          onClose();
        }
      }}
    >
      <DialogContent
        className="sm:max-w-lg bg-card border-border text-card-foreground shadow-2xl p-6 rounded-2xl"
        aria-describedby="delete-category-description"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl shrink-0">
              <Trash2 className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Delete Custom Category
              </DialogTitle>
              <div id="delete-category-description" className="text-xs text-muted-foreground mt-0.5">
                Confirm deletion and reassign transactions for{" "}
                <span className="font-semibold text-foreground">
                  &quot;{categoryToDelete.name}&quot;
                </span>
                .
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {serverError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium leading-relaxed">{serverError}</span>
            </div>
          )}

          {/* Visual Sequence: Source -> Target */}
          <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Category to Delete
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-destructive truncate max-w-[140px] sm:max-w-[180px]">
                    {categoryToDelete.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">
                    {categoryToDelete.type}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center p-2 rounded-full bg-background border border-border text-muted-foreground shrink-0 mx-2">
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </div>

              <div className="space-y-1 text-right">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Reassign Target
                </span>
                <div className="flex items-center justify-end gap-2">
                  <span className="font-bold text-sm text-foreground truncate max-w-[140px] sm:max-w-[180px]">
                    {selectedTarget ? selectedTarget.name : "None Selected"}
                  </span>
                  {selectedTarget && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                      {selectedTarget.isSystemDefault ? "Default" : "Custom"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Policy Information Callout */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 dark:bg-amber-500/10 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
              <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Mandatory Transaction Reassignment Policy (BR-013)</span>
            </div>
            <p className="text-amber-800/90 dark:text-amber-200/80 leading-relaxed text-[11px]">
              To protect ledger accuracy and prevent orphan records, all existing transactions in{" "}
              <strong>&quot;{categoryToDelete.name}&quot;</strong> will be atomically reassigned to the selected replacement category before deletion.
            </p>
          </div>

          {/* Replacement Category Selector */}
          <div className="space-y-2">
            <label
              htmlFor={selectId}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
              <span>
                Select Replacement {categoryToDelete.type === "EXPENSE" ? "Expense" : "Income"} Category <span className="text-destructive">*</span>
              </span>
            </label>

            {compatibleCategories.length > 0 ? (
              <select
                id={selectId}
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                disabled={isSubmitting}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px] outline-none transition-all cursor-pointer font-medium"
                aria-label={`Select replacement category for ${categoryToDelete.name}`}
              >
                {compatibleCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.isSystemDefault ? "(System Default)" : "(Custom User)"}
                  </option>
                ))}
              </select>
            ) : (
              <div
                role="alert"
                className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  No other {categoryToDelete.type.toLowerCase()} categories found. Please create another category before deleting this one.
                </span>
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">
              Only compatible {categoryToDelete.type.toLowerCase()} categories are eligible as reassignment targets.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-border bg-background text-foreground hover:bg-muted font-medium min-h-[44px] rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting || !targetCategoryId || compatibleCategories.length === 0}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold min-h-[44px] rounded-xl shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                <span>Reassigning & Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                <span>Reassign & Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
