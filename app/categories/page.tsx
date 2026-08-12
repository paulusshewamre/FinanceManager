"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tag,
  Plus,
  Lock,
  Edit2,
  Trash2,
  TrendingDown,
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { AddEditCategoryModal } from "@/components/categories/add-edit-category-modal";
import { DeleteCategoryModal, type CategoryItem } from "@/components/categories/delete-category-modal";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State: "ALL" | "EXPENSE" | "INCOME"
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await res.json();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = categories.filter((c) => {
    if (activeTab === "ALL") return true;
    return c.type === activeTab;
  });

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");
  const incomeCategories = categories.filter((c) => c.type === "INCOME");

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Primary Action Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[var(--card)] rounded-2xl border border-[var(--border)] shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8]">
                Category Domain Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
              Categories Ledger
            </h1>
            <p className="text-sm text-[#94a3b8]">
              Manage system default defaults and customize your personal income and expense taxonomy.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => {
                setCategoryToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Categories Overview & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 p-1 bg-[#1b2024] rounded-xl border border-[#303539]">
            <button
              onClick={() => setActiveTab("ALL")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "ALL"
                  ? "bg-[#38bdf8] text-[#001e2c] shadow-xs"
                  : "text-[#94a3b8] hover:text-[#dee3e8]"
              }`}
            >
              All Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab("EXPENSE")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "EXPENSE"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs"
                  : "text-[#94a3b8] hover:text-[#dee3e8]"
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Expenses ({expenseCategories.length})
            </button>
            <button
              onClick={() => setActiveTab("INCOME")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === "INCOME"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs"
                  : "text-[#94a3b8] hover:text-[#dee3e8]"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Income ({incomeCategories.length})
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchCategories}
            disabled={isLoading}
            className="border-[#303539] bg-[#1b2024] text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3 bg-[#1b2024]/50 rounded-2xl border border-[#303539]">
            <Loader2 className="w-8 h-8 animate-spin text-[#38bdf8]" />
            <p className="text-xs text-[#94a3b8]">Loading categories taxonomy...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
            <Button size="sm" variant="outline" onClick={fetchCategories} className="border-rose-500/30 text-rose-300">
              Retry
            </Button>
          </div>
        ) : (
          /* Categories Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((cat) => (
              <Card
                key={cat.id}
                className="bg-[#1b2024] border-[#303539] text-[#dee3e8] hover:border-[#38bdf8]/40 transition-all group relative overflow-hidden"
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-xl border ${
                        cat.type === "INCOME"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}
                    >
                      <Tag className="w-4 h-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold text-[#dee3e8] group-hover:text-[#38bdf8] transition-colors">
                        {cat.name}
                      </CardTitle>
                      <CardDescription className="text-[11px] text-[#94a3b8]">
                        {cat.type} Category
                      </CardDescription>
                    </div>
                  </div>

                  {cat.isSystemDefault ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0f1418] border border-[#303539] text-[#94a3b8] flex items-center gap-1">
                      <Lock className="w-3 h-3 text-[#38bdf8]" />
                      Default
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8]">
                      Custom
                    </span>
                  )}
                </CardHeader>

                <CardContent className="p-4 pt-2 flex items-center justify-between text-xs text-[#94a3b8]">
                  <span className="text-[11px]">
                    {cat.isSystemDefault
                      ? "System Protected"
                      : "User Managed"}
                  </span>

                  {!cat.isSystemDefault && (
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setCategoryToEdit(cat);
                          setIsAddModalOpen(true);
                        }}
                        className="h-7 w-7 p-0 text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#22272b]"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setCategoryToDelete(cat)}
                        className="h-7 w-7 p-0 text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10"
                        title="Delete category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      <AddEditCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setCategoryToEdit(null);
        }}
        onSuccess={fetchCategories}
        categoryToEdit={categoryToEdit}
      />

      {/* Delete & Reassign Modal */}
      <DeleteCategoryModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onSuccess={fetchCategories}
        categoryToDelete={categoryToDelete}
        availableCategories={categories}
      />
    </div>
  );
}
