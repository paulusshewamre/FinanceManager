"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PieChart, AlertCircle, X } from "lucide-react";
import { budgetSchema, type BudgetInput } from "@/lib/validations/budget";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface BudgetItem {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  spent: number;
  remaining: number;
  overrun: number;
  percentage: number;
  status: "NORMAL" | "WARNING" | "EXCEEDED";
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    isSystemDefault: boolean;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
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
  const [serverError, setServerError] = useState<string | null>(null);

  const isEditing = !!budgetToEdit;
  const expenseCategories = availableCategories.filter((c) => c.type === "EXPENSE");

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
    setServerError(null);
  }, [budgetToEdit, reset, isOpen, currentMonth, currentYear, availableCategories]);

  if (!isOpen) return null;

  const onSubmit = async (data: BudgetInput) => {
    setServerError(null);
    try {
      const url = isEditing ? `/api/budgets/${budgetToEdit.id}` : "/api/budgets";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || "Failed to save budget");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred");
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
            <div className="p-2 bg-[#38bdf8]/10 rounded-xl border border-[#38bdf8]/20 text-[#38bdf8]">
              <PieChart className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl font-bold text-[#dee3e8]">
              {isEditing ? "Edit Category Budget" : "Set Category Budget"}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#94a3b8]">
            {isEditing
              ? "Adjust monthly spending ceiling limit for this category"
              : "Establish a spending limit ceiling for an expense category"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit as any)}>
          <CardContent className="space-y-4 pt-2">
            {serverError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Category Select */}
            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                Expense Category
              </label>
              <select
                id="categoryId"
                disabled={isEditing || isSubmitting}
                {...register("categoryId")}
                className="w-full h-10 bg-[#0f1418] border border-[#303539] rounded-md px-3 text-xs text-[#dee3e8] focus:border-[#38bdf8] outline-none"
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
                <p className="text-xs text-rose-400">{errors.categoryId.message}</p>
              )}
            </div>

            {/* Spending Limit Amount */}
            <div className="space-y-1.5">
              <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                Monthly Spending Limit ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#94a3b8] font-mono">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="500.00"
                  disabled={isSubmitting}
                  {...register("amount")}
                  className="bg-[#0f1418] border-[#303539] focus:border-[#38bdf8] text-[#dee3e8] pl-7 font-mono"
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-400">{errors.amount.message}</p>
              )}
            </div>

            {/* Month & Year Selection */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="month" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                  Month
                </label>
                <select
                  id="month"
                  disabled={isEditing || isSubmitting}
                  {...register("month")}
                  className="w-full h-10 bg-[#0f1418] border border-[#303539] rounded-md px-3 text-xs text-[#dee3e8] focus:border-[#38bdf8] outline-none"
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
                <label htmlFor="year" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                  Year
                </label>
                <Input
                  id="year"
                  type="number"
                  disabled={isEditing || isSubmitting}
                  {...register("year")}
                  className="bg-[#0f1418] border-[#303539] text-[#dee3e8] font-mono"
                />
              </div>
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
              type="submit"
              disabled={isSubmitting}
              className="bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold"
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
