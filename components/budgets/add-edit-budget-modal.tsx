"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PieChart, AlertCircle } from "lucide-react";
import { budgetSchema, type BudgetInput } from "@/lib/validations/budget";
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
import { useUserPreferences } from "@/lib/context/user-preferences-context";

export interface BudgetItem {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "NORMAL" | "WARNING" | "EXCEEDED";
  overrun: number;
  category: {
    id: string;
    name: string;
    type: string;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  type: string;
  isSystemDefault: boolean;
}

interface AddEditBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentMonth: number;
  currentYear: number;
  budgetToEdit?: BudgetItem | null;
  availableCategories: CategoryItem[];
}

export function AddEditBudgetModal({
  isOpen,
  onClose,
  onSuccess,
  currentMonth,
  currentYear,
  budgetToEdit,
  availableCategories,
}: AddEditBudgetModalProps) {
  const { currencySymbol } = useUserPreferences();
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!budgetToEdit;
  const expenseCategories = useMemo(
    () => availableCategories.filter((c) => c.type === "EXPENSE"),
    [availableCategories]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema) as any,
    defaultValues: {
      categoryId: "",
      amount: 500,
      month: currentMonth,
      year: currentYear,
    },
  });

  useEffect(() => {
    if (!isOpen) return;
    if (budgetToEdit) {
      reset({
        categoryId: budgetToEdit.categoryId,
        amount: budgetToEdit.amount,
        month: budgetToEdit.month,
        year: budgetToEdit.year,
      });
    } else {
      reset({
        categoryId: expenseCategories[0]?.id || "",
        amount: 500,
        month: currentMonth,
        year: currentYear,
      });
    }
  }, [isOpen, budgetToEdit, currentMonth, currentYear, reset, expenseCategories]);

  const onSubmit = async (data: BudgetInput) => {
    setServerError(null);
    try {
      const url = isEditing && budgetToEdit ? `/api/budgets/${budgetToEdit.id}` : "/api/budgets";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        categoryId: data.categoryId || budgetToEdit?.categoryId || "",
        amount: Number(data.amount),
        month: Number(data.month || budgetToEdit?.month || currentMonth),
        year: Number(data.year || budgetToEdit?.year || currentYear),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let body: any = {};
      try {
        body = await res.json();
      } catch {
        body = { error: `Server returned HTTP status ${res.status}` };
      }

      if (!res.ok) {
        setServerError(body.error || "Failed to save category budget limit");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-card border-border text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {isEditing ? "Edit Category Budget" : "Set Category Budget"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Adjust monthly spending ceiling limit for this category"
                  : "Establish a spending limit ceiling for an expense category"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 pt-1">
          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Category Select */}
          <div className="space-y-1.5">
            <label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Expense Category
            </label>
            <select
              id="categoryId"
              disabled={isEditing || isSubmitting}
              {...register("categoryId")}
              className="w-full h-10 bg-background border border-border rounded-lg px-3 text-xs text-foreground focus:border-primary outline-none"
            >
              {expenseCategories.length === 0 ? (
                <option value="">No expense categories found</option>
              ) : (
                expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isSystemDefault ? "(Default)" : "(Custom)"}
                  </option>
                ))
              )}
            </select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">{errors.categoryId.message}</p>
            )}
          </div>

          {/* Spending Limit Amount */}
          <div className="space-y-1.5">
            <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Monthly Spending Limit ({currencySymbol})
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">
                {currencySymbol}
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="500.00"
                disabled={isSubmitting}
                {...register("amount")}
                className="bg-background border-border focus-visible:ring-primary text-foreground pl-7 font-mono text-xs"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount.message}</p>
            )}
          </div>

          {/* Month & Year Selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="month" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Month
              </label>
              <select
                id="month"
                disabled={isEditing || isSubmitting}
                {...register("month")}
                className="w-full h-10 bg-background border border-border rounded-lg px-3 text-xs text-foreground focus:border-primary outline-none"
              >
                {[
                  { val: 1, name: "January" },
                  { val: 2, name: "February" },
                  { val: 3, name: "March" },
                  { val: 4, name: "April" },
                  { val: 5, name: "May" },
                  { val: 6, name: "June" },
                  { val: 7, name: "July" },
                  { val: 8, name: "August" },
                  { val: 9, name: "September" },
                  { val: 10, name: "October" },
                  { val: 11, name: "November" },
                  { val: 12, name: "December" },
                ].map((m) => (
                  <option key={m.val} value={m.val}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="year" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Year
              </label>
              <Input
                id="year"
                type="number"
                disabled={isEditing || isSubmitting}
                {...register("year")}
                className="bg-background border-border text-foreground font-mono focus-visible:ring-primary text-xs"
              />
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
                "Update Limit"
              ) : (
                "Set Budget"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
