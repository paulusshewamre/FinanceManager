"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Tag, AlertCircle } from "lucide-react";
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

interface AddEditCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categoryToEdit?: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    isSystemDefault: boolean;
  } | null;
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

      const res = await fetch(url, {
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
      setServerError(err.message || "An unexpected error occurred");
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
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {isEditing ? "Edit Custom Category" : "Add Custom Category"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Update custom category name or flow type"
                  : "Create a new custom category for organizing your ledger"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Category Type Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category Type
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setValue("type", CategoryTypeEnum.EXPENSE)}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  selectedType === CategoryTypeEnum.EXPENSE
                    ? "bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/40 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Expense Category
              </button>
              <button
                type="button"
                onClick={() => setValue("type", CategoryTypeEnum.INCOME)}
                className={`py-2 text-xs font-semibold rounded-md transition-all ${
                  selectedType === CategoryTypeEnum.INCOME
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Income Category
              </button>
            </div>
          </div>

          {/* Category Name Input */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Category Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="e.g. Subscriptions, Gym, Consulting"
              disabled={isSubmitting}
              {...register("name")}
              className="bg-background border-border text-foreground focus-visible:ring-primary text-xs"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
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
              type="submit"
              disabled={isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
