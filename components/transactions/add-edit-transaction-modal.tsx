"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, DollarSign, AlertCircle, Calendar, Store, FileText } from "lucide-react";
import { transactionSchema, type TransactionInput } from "@/lib/validations/transaction";
import { CategoryTypeEnum } from "@/lib/validations/category";
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

export interface CategoryItem {
  id: string;
  name: string;
  type: "INCOME" | "EXPENSE";
  isSystemDefault: boolean;
}

interface AddEditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableCategories?: CategoryItem[];
  transactionToEdit?: {
    id: string;
    categoryId: string;
    amount: number;
    type: "INCOME" | "EXPENSE";
    transactionDate: string;
    merchantName?: string | null;
    notes?: string | null;
  } | null;
}

export function AddEditTransactionModal({
  isOpen,
  onClose,
  onSuccess,
  availableCategories: propCategories,
  transactionToEdit,
}: AddEditTransactionModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [fetchedCategories, setFetchedCategories] = useState<CategoryItem[]>([]);

  useEffect(() => {
    if (isOpen && (!propCategories || propCategories.length === 0)) {
      fetch("/api/categories")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setFetchedCategories(data);
          } else if (data && Array.isArray(data.categories)) {
            setFetchedCategories(data.categories);
          }
        })
        .catch((err) => console.error("Error fetching categories for modal:", err));
    }
  }, [isOpen, propCategories]);

  const categories = propCategories && propCategories.length > 0 ? propCategories : fetchedCategories;

  const isEditing = !!transactionToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionInput>({
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: {
      categoryId: "",
      amount: 0,
      type: CategoryTypeEnum.EXPENSE,
      transactionDate: new Date(),
      merchantName: "",
      notes: "",
    },
  });

  const selectedType = watch("type");
  const selectedCategoryId = watch("categoryId");

  // Filter categories matching the selected type (BR-003)
  const compatibleCategories = categories.filter(
    (c) => c.type === selectedType
  );

  useEffect(() => {
    if (transactionToEdit) {
      const dateObj = new Date(transactionToEdit.transactionDate);
      const formattedDate = !isNaN(dateObj.getTime())
        ? dateObj.toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      reset({
        categoryId: transactionToEdit.categoryId,
        amount: Number(transactionToEdit.amount),
        type: transactionToEdit.type,
        transactionDate: formattedDate as any,
        merchantName: transactionToEdit.merchantName || "",
        notes: transactionToEdit.notes || "",
      });
    } else {
      const defaultCat = compatibleCategories[0]?.id || "";
      reset({
        categoryId: defaultCat,
        amount: undefined as any,
        type: CategoryTypeEnum.EXPENSE,
        transactionDate: new Date().toISOString().slice(0, 16) as any,
        merchantName: "",
        notes: "",
      });
    }
    setServerError(null);
  }, [transactionToEdit, reset, isOpen]);

  // When type changes, auto-select first compatible category if current selection is invalid
  useEffect(() => {
    if (compatibleCategories.length > 0) {
      const isCurrentValid = compatibleCategories.some(
        (c) => c.id === selectedCategoryId
      );
      if (!isCurrentValid) {
        setValue("categoryId", compatibleCategories[0].id);
      }
    } else {
      setValue("categoryId", "");
    }
  }, [selectedType, categories]);

  const onSubmit = async (data: TransactionInput) => {
    setServerError(null);
    try {
      const url = isEditing
        ? `/api/transactions/${transactionToEdit.id}`
        : "/api/transactions";
      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...data,
        transactionDate: new Date(data.transactionDate).toISOString(),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || "Failed to save transaction");
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
      <DialogContent className="sm:max-w-lg bg-card border-border text-card-foreground shadow-2xl p-6">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {isEditing ? "Edit Transaction" : "Log New Transaction"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {isEditing
                  ? "Update transaction amounts, backdated dates, or categories"
                  : "Record an income or expense transaction in your ledger"}
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

          {/* Type Switcher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Flow Type
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
                - Expense
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
                + Income
              </button>
            </div>
          </div>

          {/* Amount & Category Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Amount ($)
              </label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                disabled={isSubmitting}
                {...register("amount")}
                className="bg-background border-border text-foreground font-mono focus-visible:ring-primary text-xs"
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <select
                id="categoryId"
                disabled={isSubmitting}
                {...register("categoryId")}
                className="w-full h-10 bg-background border border-border rounded-lg px-3 text-xs text-foreground focus:border-primary outline-none"
              >
                {compatibleCategories.length === 0 ? (
                  <option value="">No {selectedType.toLowerCase()} categories found</option>
                ) : (
                  compatibleCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.isSystemDefault ? "(Default)" : ""}
                    </option>
                  ))
                )}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </div>

          {/* Date & Merchant Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="transactionDate" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Date & Time
              </label>
              <Input
                id="transactionDate"
                type="datetime-local"
                disabled={isSubmitting}
                {...register("transactionDate")}
                className="bg-background border-border text-foreground focus-visible:ring-primary text-xs"
              />
              {errors.transactionDate && (
                <p className="text-xs text-destructive">{errors.transactionDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="merchantName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-primary" />
                Merchant / Payee
              </label>
              <Input
                id="merchantName"
                type="text"
                placeholder="e.g. Starbucks, Client Payment"
                disabled={isSubmitting}
                {...register("merchantName")}
                className="bg-background border-border text-foreground focus-visible:ring-primary text-xs"
              />
              {errors.merchantName && (
                <p className="text-xs text-destructive">{errors.merchantName.message}</p>
              )}
            </div>
          </div>

          {/* Notes Input */}
          <div className="space-y-1.5">
            <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-primary" />
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              rows={2}
              placeholder="Additional details or reference notes..."
              disabled={isSubmitting}
              {...register("notes")}
              className="w-full bg-background border border-border rounded-lg p-2.5 text-xs text-foreground focus:border-primary outline-none resize-none"
            />
            {errors.notes && (
              <p className="text-xs text-destructive">{errors.notes.message}</p>
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
                "Log Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
