"use client";

import { useState, useEffect } from "react";
import { Trash2, AlertTriangle, Loader2, X, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  if (!isOpen || !categoryToDelete) return null;

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
              Delete Custom Category
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#94a3b8]">
            Are you sure you want to delete <span className="font-semibold text-rose-400">&quot;{categoryToDelete.name}&quot;</span>?
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {serverError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="p-3 rounded-lg bg-[#0f1418] border border-[#303539] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Transaction Reassignment Policy (BR-013)</span>
            </div>
            <p className="text-[#94a3b8] leading-relaxed">
              If this category has active transactions, they will automatically be reassigned to the target category selected below before deletion.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0] flex items-center gap-1.5">
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#38bdf8]" />
              Reassign Transactions To
            </label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full bg-[#0f1418] border border-[#303539] rounded-lg px-3 py-2 text-xs text-[#dee3e8] focus:border-[#38bdf8] outline-none"
            >
              {compatibleCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} {cat.isSystemDefault ? "(Default)" : ""}
                </option>
              ))}
            </select>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-[#303539] bg-[#0f1418] text-[#dee3e8] hover:bg-[#22272b]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="bg-rose-600 text-white hover:bg-rose-700 font-semibold"
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
        </CardFooter>
      </Card>
    </div>
  );
}
