"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  Search,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { AddEditCategoryModal, type CategoryModalItem } from "@/components/categories/add-edit-category-modal";
import { DeleteCategoryModal, type CategoryItem } from "@/components/categories/delete-category-modal";
import { safeFetch } from "@/lib/api/safe-fetch";

export default function CategoriesPage() {
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search States
  const [activeTab, setActiveTab] = useState<"ALL" | "EXPENSE" | "INCOME">("ALL");
  const [originFilter, setOriginFilter] = useState<"ALL" | "SYSTEM" | "CUSTOM">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryModalItem | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await safeFetch("/api/categories");
      if (!res.ok) {
        throw new Error("Failed to fetch categories taxonomy");
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "An error occurred while loading categories");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Derived counts for overview KPI metrics
  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type === "EXPENSE"),
    [categories]
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === "INCOME"),
    [categories]
  );
  const systemCategories = useMemo(
    () => categories.filter((c) => c.isSystemDefault),
    [categories]
  );
  const customCategories = useMemo(
    () => categories.filter((c) => !c.isSystemDefault),
    [categories]
  );

  // Filtered categories based on tab, origin, and search query
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      // Flow type filter
      if (activeTab !== "ALL" && cat.type !== activeTab) {
        return false;
      }
      // Origin filter
      if (originFilter === "SYSTEM" && !cat.isSystemDefault) {
        return false;
      }
      if (originFilter === "CUSTOM" && cat.isSystemDefault) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        if (!cat.name.toLowerCase().includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [categories, activeTab, originFilter, searchQuery]);

  const handleResetFilters = () => {
    setActiveTab("ALL");
    setOriginFilter("ALL");
    setSearchQuery("");
  };

  const isFiltered = activeTab !== "ALL" || originFilter !== "ALL" || searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200" suppressHydrationWarning>
      <Navbar />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-8" suppressHydrationWarning>
        {/* Header & Primary Action Banner */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-card rounded-2xl border border-border shadow-xs">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Taxonomy & Ledger Organization</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Categories Ledger
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              Manage system default classifications and customize your personal income and expense categories for ledger tracking and budgeting.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="default"
              onClick={fetchCategories}
              disabled={isLoading}
              className="border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted min-h-[44px] px-3.5 rounded-xl flex items-center gap-2"
              aria-label="Refresh categories list"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <Button
              onClick={() => {
                setCategoryToEdit(null);
                setIsAddModalOpen(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-h-[44px] px-4 rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-[0.98]"
              aria-label="Add new custom category"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Add Category</span>
            </Button>
          </div>
        </header>

        {/* 4-Card KPI Overview Metrics */}
        {isLoading ? (
          <section aria-label="Loading Overview Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-card border border-border/60 rounded-2xl p-4 animate-pulse space-y-2"
              >
                <div className="h-3 w-20 bg-muted rounded-md" />
                <div className="h-6 w-12 bg-muted rounded-md" />
              </div>
            ))}
          </section>
        ) : (
          <section aria-label="Categories Overview Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Categories */}
            <Card className="bg-card border-border rounded-2xl shadow-xs p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Categories
                </span>
                <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                  <Layers className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-foreground tabular-nums">
                  {categories.length}
                </span>
                <span className="text-xs text-muted-foreground">active classifications</span>
              </div>
            </Card>

            {/* Expense Categories */}
            <Card className="bg-card border-border rounded-2xl shadow-xs p-4 hover:border-rose-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Expense Types
                </span>
                <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <TrendingDown className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                  {expenseCategories.length}
                </span>
                <span className="text-xs text-muted-foreground">spending categories</span>
              </div>
            </Card>

            {/* Income Categories */}
            <Card className="bg-card border-border rounded-2xl shadow-xs p-4 hover:border-emerald-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Income Types
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {incomeCategories.length}
                </span>
                <span className="text-xs text-muted-foreground">revenue streams</span>
              </div>
            </Card>

            {/* Custom vs Default Breakdown */}
            <Card className="bg-card border-border rounded-2xl shadow-xs p-4 hover:border-amber-500/30 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Custom vs System
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 tabular-nums">
                  {customCategories.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  custom / {systemCategories.length} default
                </span>
              </div>
            </Card>
          </section>
        )}

        {/* Filter Toolbar & Search Bar */}
        <section aria-label="Category Filters & Search" className="space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4 p-3.5 bg-card rounded-2xl border border-border shadow-xs">
            {/* Flow Type Tabs */}
            <div
              role="tablist"
              aria-label="Category Flow Type Filter"
              className="flex items-center gap-1.5 p-1 bg-background rounded-xl border border-border overflow-x-auto max-w-full scrollbar-none"
            >
              <button
                role="tab"
                aria-selected={activeTab === "ALL"}
                onClick={() => setActiveTab("ALL")}
                className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  activeTab === "ALL"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                All ({categories.length})
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "EXPENSE"}
                onClick={() => setActiveTab("EXPENSE")}
                className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === "EXPENSE"
                    ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Expenses ({expenseCategories.length})</span>
              </button>
              <button
                role="tab"
                aria-selected={activeTab === "INCOME"}
                onClick={() => setActiveTab("INCOME")}
                className={`px-3 py-2 min-h-[40px] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                  activeTab === "INCOME"
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Income ({incomeCategories.length})</span>
              </button>
            </div>

            {/* Search Input & Origin Filter Chips */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
              {/* Origin Filter Chips */}
              <div
                role="group"
                aria-label="Category Origin Filter"
                className="flex items-center gap-1 p-1 bg-background rounded-xl border border-border shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setOriginFilter("ALL")}
                  className={`px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-all ${
                    originFilter === "ALL"
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setOriginFilter("SYSTEM")}
                  className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    originFilter === "SYSTEM"
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Lock className="w-3 h-3 text-primary" aria-hidden="true" />
                  <span>Defaults</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOriginFilter("CUSTOM")}
                  className={`px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    originFilter === "CUSTOM"
                      ? "bg-muted text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-primary" aria-hidden="true" />
                  <span>Custom</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 sm:w-56 sm:min-w-[180px]">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true" />
                <Input
                  id="category-search"
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9.5 pr-8 bg-background border-border text-foreground text-xs min-h-[40px] rounded-xl focus-visible:ring-primary w-full"
                  aria-label="Search categories by name"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Filter Announcement & Reset Helper */}
          <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
            <span aria-live="polite">
              Showing <strong className="text-foreground">{filteredCategories.length}</strong> of {categories.length} categories
            </span>
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-primary hover:underline font-medium min-h-[36px] flex items-center gap-1"
              >
                <X className="w-3 h-3" aria-hidden="true" />
                <span>Reset all filters</span>
              </button>
            )}
          </div>
        </section>

        {/* Canonical UI States */}
        {/* 1. Loading State */}
        {isLoading ? (
          <section aria-label="Loading Categories" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card
                key={i}
                className="bg-card border-border/60 rounded-2xl p-5 animate-pulse space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted" />
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 bg-muted rounded-md" />
                      <div className="h-3 w-16 bg-muted rounded-md" />
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-muted rounded-full" />
                </div>
                <div className="h-8 bg-muted/40 rounded-lg" />
                <div className="pt-3 border-t border-border/40 flex justify-between">
                  <div className="h-4 w-20 bg-muted rounded-md" />
                  <div className="h-7 w-16 bg-muted rounded-md" />
                </div>
              </Card>
            ))}
          </section>
        ) : error ? (
          /* 2. Error State */
          <div
            role="alert"
            className="p-5 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/20 rounded-xl">
                <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Unable to load categories</p>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchCategories}
              className="border-destructive/30 text-destructive hover:bg-destructive/10 min-h-[40px] px-4 rounded-xl shrink-0"
            >
              Try Again
            </Button>
          </div>
        ) : categories.length === 0 ? (
          /* 3. Account Empty State */
          <Card className="bg-card border-border rounded-2xl p-12 text-center shadow-xs">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                <Tag className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">No Categories Found</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Start organizing your ledger by adding your first income stream or expense category.
                </p>
              </div>
              <Button
                onClick={() => {
                  setCategoryToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold min-h-[44px] px-5 rounded-xl shadow-xs"
              >
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Create Your First Category
              </Button>
            </div>
          </Card>
        ) : filteredCategories.length === 0 ? (
          /* 4. Filtered Empty State */
          <Card className="bg-card border-border rounded-2xl p-12 text-center shadow-xs">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-muted text-muted-foreground flex items-center justify-center">
                <Search className="w-7 h-7" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-foreground">No Matching Categories</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No categories match your active filters {searchQuery ? `for "${searchQuery}"` : ""}. Try adjusting your search query or reset filters.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleResetFilters}
                className="border-border text-foreground hover:bg-muted min-h-[44px] px-4 rounded-xl font-medium"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        ) : (
          /* 5. Ideal / Populated State: Responsive Grid (1-col mobile, 2-col tablet, 3-col desktop) */
          <section
            aria-label="Category Cards Grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
          >
            {filteredCategories.map((cat) => {
              const isExpense = cat.type === "EXPENSE";

              return (
                <article
                  key={cat.id}
                  className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between space-y-4"
                >
                  {/* Card Header */}
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2.5 rounded-xl border shrink-0 ${
                            isExpense
                              ? "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isExpense ? (
                            <TrendingDown className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <TrendingUp className="w-4 h-4" aria-hidden="true" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3
                            className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate"
                            title={cat.name}
                          >
                            {cat.name}
                          </h3>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            {isExpense ? "Expense Category" : "Income Category"}
                          </span>
                        </div>
                      </div>

                      {/* Origin Badge */}
                      {cat.isSystemDefault ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-muted border border-border text-muted-foreground flex items-center gap-1 shrink-0">
                          <Lock className="w-3 h-3 text-primary" aria-hidden="true" />
                          <span>System Default</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-primary/10 border border-primary/20 text-primary flex items-center gap-1 shrink-0">
                          <Sparkles className="w-3 h-3" aria-hidden="true" />
                          <span>Custom</span>
                        </span>
                      )}
                    </div>

                    {/* Card Description / Policy Context */}
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {cat.isSystemDefault
                        ? "Core system default classification. Ready for ledger transactions and budget tracking."
                        : "Custom user-defined category. Fully editable and safely reassignable on deletion."}
                    </p>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      {cat.isSystemDefault ? (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                          <span>Protected Category</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                          <span>User Managed</span>
                        </>
                      )}
                    </span>

                    {/* Action Controls for Custom Categories */}
                    {!cat.isSystemDefault ? (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setCategoryToEdit(cat);
                            setIsAddModalOpen(true);
                          }}
                          className="h-9 px-2.5 min-h-[36px] text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg flex items-center gap-1.5"
                          aria-label={`Edit custom category "${cat.name}"`}
                        >
                          <Edit2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCategoryToDelete(cat)}
                          className="h-9 px-2.5 min-h-[36px] text-xs font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg flex items-center gap-1.5"
                          aria-label={`Delete custom category "${cat.name}"`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/80 italic">
                        Read Only
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
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
