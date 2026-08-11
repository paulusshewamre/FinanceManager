"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Tag, AlertCircle, X } from "lucide-react";
import { categorySchema, type CategoryInput, CategoryTypeEnum } from "@/lib/validations/category";
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

  if (!isOpen) return null;

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
              <Tag className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl font-bold text-[#dee3e8]">
              {isEditing ? "Edit Custom Category" : "Add Custom Category"}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#94a3b8]">
            {isEditing
              ? "Update custom category name or flow type"
              : "Create a new custom category for organizing your ledger"}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-2">
            {serverError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Category Type Switcher */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                Category Type
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[#0f1418] rounded-lg border border-[#303539]">
                <button
                  type="button"
                  onClick={() => setValue("type", CategoryTypeEnum.EXPENSE)}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    selectedType === CategoryTypeEnum.EXPENSE
                      ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs"
                      : "text-[#94a3b8] hover:text-[#dee3e8]"
                  }`}
                >
                  Expense Category
                </button>
                <button
                  type="button"
                  onClick={() => setValue("type", CategoryTypeEnum.INCOME)}
                  className={`py-2 text-xs font-semibold rounded-md transition-all ${
                    selectedType === CategoryTypeEnum.INCOME
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs"
                      : "text-[#94a3b8] hover:text-[#dee3e8]"
                  }`}
                >
                  Income Category
                </button>
              </div>
            </div>

            {/* Category Name Input */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                Category Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="e.g. Subscriptions, Gym, Consulting"
                disabled={isSubmitting}
                {...register("name")}
                className="bg-[#0f1418] border-[#303539] focus:border-[#38bdf8] text-[#dee3e8]"
              />
              {errors.name && (
                <p className="text-xs text-rose-400">{errors.name.message}</p>
              )}
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
                "Save Changes"
              ) : (
                "Create Category"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
