"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Tag, AlertCircle, TrendingDown, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";
import { categorySchema, type CategoryInput, CategoryTypeEnum } from "@/lib/validations/category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { safeFetch } from "@/lib/api/safe-fetch";

export interface CategoryModalItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  isSystemDefault: boolean;
}

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: CategoryModalItem | null;
}

export function AddEditCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit,
}: AddEditCategoryModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!categoryToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: CategoryTypeEnum.EXPENSE,
    },
  });

  const selectedType = watch("type");
  const categoryName = watch("name") || "";

  useEffect(() => {
    if (categoryToEdit) {
      reset({
        name: categoryToEdit.name,
        type: categoryToEdit.type,
      });
    } else {
      reset({
        name: "",
        type: CategoryTypeEnum.EXPENSE,
      });
    }
    setServerError(null);
  }, [categoryToEdit, reset, isOpen]);

  const onSubmit = async (data: CategoryInput) => {
    setServerError(null);
    try {
      const url = isEditing
        ? `/api/categories/${categoryToEdit.id}`
        : "/api/categories";
      const method = isEditing ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || "Failed to save category");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred. Please try again.");
    }
  };

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
        className="sm:max-w-md bg-card border-border text-card-foreground shadow-2xl p-6 rounded-2xl"
        aria-describedby="category-dialog-description"
      >
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${
                selectedType === CategoryTypeEnum.EXPENSE
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                  : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {isEditing ? (
                <Sparkles className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Tag className="w-5 h-5" aria-hidden="true" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {isEditing ? "Edit Custom Category" : "Add Custom Category"}
              </DialogTitle>
              <div id="category-dialog-description" className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? `Update the name or flow classification for "${categoryToEdit?.name}".`
                  : "Create a new custom category for organizing your income and expense transactions."}
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {serverError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="font-medium leading-relaxed">{serverError}</span>
            </div>
          )}

          {/* Category Type Switcher */}
          <div className="space-y-2">
            <label
              id="category-type-label"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
            >
              Transaction Flow Type
            </label>
            <div
              role="group"
              aria-labelledby="category-type-label"
              className="grid grid-cols-2 gap-2 p-1.5 bg-muted/50 rounded-xl border border-border"
            >
              <button
                type="button"
                role="radio"
                aria-checked={selectedType === CategoryTypeEnum.EXPENSE}
                onClick={() => setValue("type", CategoryTypeEnum.EXPENSE)}
                disabled={isSubmitting}
                className={`py-2.5 px-3 min-h-[44px] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  selectedType === CategoryTypeEnum.EXPENSE
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 shadow-xs font-bold ring-1 ring-rose-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <TrendingDown className="w-4 h-4" aria-hidden="true" />
                <span>Expense Category</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedType === CategoryTypeEnum.INCOME}
                onClick={() => setValue("type", CategoryTypeEnum.INCOME)}
                disabled={isSubmitting}
                className={`py-2.5 px-3 min-h-[44px] text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  selectedType === CategoryTypeEnum.INCOME
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-xs font-bold ring-1 ring-emerald-500/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <TrendingUp className="w-4 h-4" aria-hidden="true" />
                <span>Income Category</span>
              </button>
            </div>
          </div>

          {/* Category Name Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="name"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Category Name <span className="text-destructive">*</span>
              </label>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {categoryName.length}/50
              </span>
            </div>
            <Input
              id="name"
              type="text"
              placeholder={
                selectedType === CategoryTypeEnum.EXPENSE
                  ? "e.g. Subscriptions, Groceries, Dining Out"
                  : "e.g. Consulting, Freelance, Dividend"
              }
              disabled={isSubmitting}
              maxLength={50}
              aria-required="true"
              aria-invalid={!!errors.name || !!serverError}
              aria-describedby={
                errors.name ? "name-error" : "name-hint"
              }
              {...register("name")}
              className="bg-background border-border text-foreground focus-visible:ring-primary text-sm min-h-[44px] rounded-xl"
            />
            {errors.name ? (
              <p
                id="name-error"
                role="alert"
                className="text-xs text-destructive flex items-center gap-1.5 mt-1"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>{errors.name.message}</span>
              </p>
            ) : (
              <p
                id="name-hint"
                className="text-[11px] text-muted-foreground leading-normal"
              >
                Category names must be unique within {selectedType.toLowerCase()} classifications.
              </p>
            )}
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
              type="submit"
              disabled={isSubmitting || !categoryName.trim()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-h-[44px] rounded-xl shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  <span>Saving...</span>
                </>
              ) : isEditing ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>Save Changes</span>
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4 mr-2" aria-hidden="true" />
                  <span>Create Category</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
