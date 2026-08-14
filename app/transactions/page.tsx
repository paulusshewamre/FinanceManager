"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Calendar,
  Edit2,
  Trash2,
  Loader2,
  AlertOctagon,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Tag,
  Store,
  FileText,
  X,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  AddEditTransactionModal,
  type CategoryItem,
} from "@/components/transactions/add-edit-transaction-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUserPreferences } from "@/lib/context/user-preferences-context";

export interface TransactionItem {
  id: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  transactionDate: string;
  merchantName?: string | null;
  notes?: string | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function TransactionsPage() {
  const { formatCurrency } = useUserPreferences();
  const [mounted, setMounted] = useState(false);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter Toolbar States
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Modal & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionItem | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<TransactionItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      typeFilter !== "ALL" ||
      categoryFilter !== "ALL" ||
      startDate.length > 0 ||
      endDate.length > 0
    );
  }, [searchQuery, typeFilter, categoryFilter, startDate, endDate]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim().length > 0) count++;
    if (typeFilter !== "ALL") count++;
    if (categoryFilter !== "ALL") count++;
    if (startDate.length > 0 || endDate.length > 0) count++;
    return count;
  }, [searchQuery, typeFilter, categoryFilter, startDate, endDate]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  }, []);

  const fetchTransactions = useCallback(
    async (pageToFetch = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.set("page", pageToFetch.toString());
        params.set("limit", "10");

        if (typeFilter !== "ALL") params.set("type", typeFilter);
        if (categoryFilter !== "ALL") params.set("categoryId", categoryFilter);
        if (startDate) params.set("startDate", startDate);
        if (endDate) params.set("endDate", endDate);
        if (searchQuery.trim()) params.set("search", searchQuery.trim());

        const res = await fetch(`/api/transactions?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to fetch transactions");
        }
        const data = await res.json();
        setTransactions(data.transactions);
        setPagination(data.pagination);
      } catch (err: any) {
        setError(err.message || "An error occurred while loading ledger");
      } finally {
        setIsLoading(false);
      }
    },
    [typeFilter, categoryFilter, startDate, endDate, searchQuery]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setCategoryFilter("ALL");
    setStartDate("");
    setEndDate("");
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    setDeletingId(transactionToDelete.id);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/transactions/${transactionToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const body = await res.json();
        setDeleteError(body.error || "Failed to delete transaction");
        return;
      }
      setTransactionToDelete(null);
      fetchTransactions(pagination.page);
    } catch (err: any) {
      setDeleteError(err.message || "Error deleting transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    if (!mounted) return "";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 md:pb-8 space-y-6">
        {/* ========================================================================= */}
        {/* Page Banner Header */}
        {/* ========================================================================= */}
        <section aria-labelledby="transactions-page-title">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-card rounded-2xl border border-border shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-primary">
                  Ledger Management
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • Income & Expense Records
                </span>
              </div>
              <h1 id="transactions-page-title" className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                Transactions Ledger
              </h1>
              <p className="text-sm text-muted-foreground">
                Monitor, search, filter, and record all cashflows across your personal finance ledger.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => {
                  setTransactionToEdit(null);
                  setIsModalOpen(true);
                }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 py-2 flex items-center gap-2 min-h-[44px] shadow-lg shadow-primary/10 text-xs"
                aria-label="Log new transaction"
              >
                <Plus className="w-4 h-4" />
                Log Transaction
              </Button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* Filter Toolbar (Responsive Desktop & Mobile Ergonomics) */}
        {/* ========================================================================= */}
        <section aria-labelledby="filter-toolbar-title">
          <Card className="bg-card border-border text-card-foreground shadow-lg">
            <CardContent className="p-4 space-y-4">
              {/* Mobile Filter Header & Toggle */}
              <div className="flex items-center justify-between sm:hidden">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <h2 id="filter-toolbar-title" className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Filter Ledger
                  </h2>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                      {activeFiltersCount} Active
                    </span>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                  className="text-xs text-muted-foreground hover:text-foreground h-9 px-2 flex items-center gap-1"
                  aria-expanded={isMobileFiltersOpen}
                  aria-label="Toggle filter controls"
                >
                  <span>{isMobileFiltersOpen ? "Hide Filters" : "Show Filters"}</span>
                  {isMobileFiltersOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Primary Search Bar (Always visible) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                {/* Search Bar */}
                <div className="relative md:col-span-2">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search payee, merchant, or notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-8 bg-background border-border focus-visible:ring-primary text-foreground text-xs min-h-[40px]"
                    aria-label="Search transactions by merchant or notes"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                      aria-label="Clear search text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Flow Type Filter */}
                <div className={`${isMobileFiltersOpen ? "block" : "hidden sm:block"}`}>
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="w-full min-h-[40px] bg-background border border-border rounded-lg px-3 text-xs text-foreground focus:border-primary outline-none"
                    aria-label="Filter by transaction type"
                  >
                    <option value="ALL">All Types</option>
                    <option value="EXPENSE">Expense Only</option>
                    <option value="INCOME">Income Only</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className={`${isMobileFiltersOpen ? "block" : "hidden sm:block"}`}>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full min-h-[40px] bg-background border border-border rounded-lg px-3 text-xs text-foreground focus:border-primary outline-none"
                    aria-label="Filter by category"
                  >
                    <option value="ALL">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Reset Action */}
                <div className={`${isMobileFiltersOpen ? "block" : "hidden sm:block"}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResetFilters}
                    disabled={!hasActiveFilters}
                    className="w-full border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted text-xs min-h-[40px] disabled:opacity-40"
                    aria-label="Reset all active filters"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Reset Filters
                  </Button>
                </div>
              </div>

              {/* Date Range Row */}
              <div
                className={`flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-border/60 text-xs text-muted-foreground ${
                  isMobileFiltersOpen ? "flex" : "hidden sm:flex"
                }`}
              >
                <span className="flex items-center gap-1.5 font-medium shrink-0">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  Date Range:
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-background border-border text-foreground text-xs min-h-[38px]"
                    aria-label="Start date filter"
                  />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-background border-border text-foreground text-xs min-h-[38px]"
                    aria-label="End date filter"
                  />
                </div>
                {hasActiveFilters && (
                  <span className="text-[11px] text-primary font-medium sm:ml-auto">
                    Filters applied ({activeFiltersCount})
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* Ledger Section (5 States: Loading, Error, Filtered Empty, Account Empty, Populated) */}
        {/* ========================================================================= */}
        <section aria-labelledby="ledger-section-title">
          <Card className="bg-card border-border text-card-foreground shadow-xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b border-border/60">
              <div>
                <CardTitle id="ledger-section-title" className="text-base font-bold text-foreground">
                  Recorded Cashflows ({pagination.totalCount})
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages || 1}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTransactions(pagination.page)}
                disabled={isLoading}
                className="border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted min-h-[36px] min-w-[36px]"
                aria-label="Refresh transaction ledger"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {/* State 1: Loading State (Shimmer Skeletons) */}
              {isLoading ? (
                <div className="p-4 space-y-3 animate-pulse" aria-busy="true" aria-label="Loading transactions">
                  {/* Desktop skeleton rows */}
                  <div className="hidden md:block space-y-3 p-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-12 bg-muted/60 rounded-xl flex items-center justify-between px-4">
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-4 w-40 bg-muted rounded" />
                        <div className="h-6 w-24 bg-muted rounded-full" />
                        <div className="h-6 w-16 bg-muted rounded-full" />
                        <div className="h-4 w-20 bg-muted rounded" />
                        <div className="h-6 w-14 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                  {/* Mobile skeleton cards */}
                  <div className="md:hidden space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 rounded-xl bg-muted/40 border border-border space-y-3">
                        <div className="flex justify-between">
                          <div className="h-4 w-32 bg-muted rounded" />
                          <div className="h-4 w-16 bg-muted rounded" />
                        </div>
                        <div className="flex justify-between">
                          <div className="h-4 w-20 bg-muted rounded" />
                          <div className="h-4 w-24 bg-muted rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : error ? (
                /* State 2: Error State */
                <div
                  role="alert"
                  className="p-8 text-center space-y-3 text-destructive"
                >
                  <AlertOctagon className="w-8 h-8 mx-auto text-destructive" />
                  <h3 className="text-sm font-bold">Failed to Load Transactions</h3>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">{error}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => fetchTransactions(1)}
                    className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs font-semibold mt-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Retry Loading
                  </Button>
                </div>
              ) : transactions.length === 0 && hasActiveFilters ? (
                /* State 3: Filtered Empty State */
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border text-muted-foreground flex items-center justify-center mx-auto">
                    <Filter className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No Matching Transactions</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      No records match your active search and filter criteria. Try adjusting or clearing your filters.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetFilters}
                    className="border-border text-primary hover:bg-primary/10 text-xs font-semibold mt-2"
                  >
                    <X className="w-3.5 h-3.5 mr-1" />
                    Clear All Filters
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                /* State 4: Account Empty State */
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                    <Store className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">No Transactions Logged Yet</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      Your personal ledger is currently empty. Record your first transaction to begin tracking your financial cashflows.
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setTransactionToEdit(null);
                      setIsModalOpen(true);
                    }}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold mt-2"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Log First Transaction
                  </Button>
                </div>
              ) : (
                /* State 5: Populated State */
                <div>
                  {/* ------------------------------------------------------------- */}
                  {/* Mobile Transaction Cards (< 768px) */}
                  {/* ------------------------------------------------------------- */}
                  <div className="md:hidden divide-y divide-border">
                    {transactions.map((txn) => {
                      const isIncome = txn.type === "INCOME";

                      return (
                        <div
                          key={txn.id}
                          className="p-4 space-y-3 bg-card hover:bg-muted/30 transition-colors"
                        >
                          {/* Card Top: Payee/Merchant + Type Badge */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`p-2 rounded-xl shrink-0 border ${
                                  isIncome
                                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                    : "bg-destructive/10 border-destructive/20 text-destructive"
                                }`}
                              >
                                {isIncome ? (
                                  <TrendingUp className="w-4 h-4" />
                                ) : (
                                  <TrendingDown className="w-4 h-4" />
                                )}
                              </div>
                              <span className="font-bold text-sm text-foreground truncate">
                                {txn.merchantName || "Unspecified Payee"}
                              </span>
                            </div>

                            {/* Type Pill */}
                            {isIncome ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shrink-0 inline-flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                INCOME
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 border border-destructive/30 text-destructive shrink-0 inline-flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                EXPENSE
                              </span>
                            )}
                          </div>

                          {/* Card Middle: Category Badge + Date + Notes */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted border border-border text-foreground inline-flex items-center gap-1">
                              <Tag className="w-3 h-3 text-primary" />
                              {txn.category?.name || "Uncategorized"}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-[11px]">
                              {formatDate(txn.transactionDate)}
                            </span>
                          </div>

                          {txn.notes && (
                            <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/40 p-2 rounded-lg border border-border/40">
                              {txn.notes}
                            </p>
                          )}

                          {/* Card Bottom: Amount + Action Buttons */}
                          <div className="flex items-center justify-between pt-1 border-t border-border/40">
                            <span
                              className={`font-mono font-bold text-base ${
                                isIncome
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-destructive"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatCurrency(txn.amount)}
                            </span>

                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setTransactionToEdit(txn);
                                  setIsModalOpen(true);
                                }}
                                className="h-10 w-10 min-h-[44px] min-w-[44px] p-0 text-muted-foreground hover:text-primary hover:bg-muted rounded-xl"
                                aria-label={`Edit transaction with ${txn.merchantName || "payee"}`}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={deletingId === txn.id}
                                onClick={() => setTransactionToDelete(txn)}
                                className="h-10 w-10 min-h-[44px] min-w-[44px] p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl"
                                aria-label={`Delete transaction with ${txn.merchantName || "payee"}`}
                              >
                                {deletingId === txn.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ------------------------------------------------------------- */}
                  {/* Desktop Transaction Table (>= 768px) */}
                  {/* ------------------------------------------------------------- */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-muted/40 border-b border-border text-muted-foreground uppercase tracking-wider font-semibold">
                          <th className="py-3.5 px-4 font-semibold">Date</th>
                          <th className="py-3.5 px-4 font-semibold">Payee & Notes</th>
                          <th className="py-3.5 px-4 font-semibold">Category</th>
                          <th className="py-3.5 px-4 font-semibold">Type</th>
                          <th className="py-3.5 px-4 text-right font-semibold">Amount</th>
                          <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {transactions.map((txn) => {
                          const isIncome = txn.type === "INCOME";

                          return (
                            <tr
                              key={txn.id}
                              className="hover:bg-muted/50 transition-colors group"
                            >
                              <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                                {formatDate(txn.transactionDate)}
                              </td>
                              <td className="py-3.5 px-4 max-w-xs">
                                <div className="font-semibold text-foreground flex items-center gap-1.5">
                                  <Store className="w-3.5 h-3.5 text-primary shrink-0" />
                                  <span className="truncate">
                                    {txn.merchantName || "Unspecified Payee"}
                                  </span>
                                </div>
                                {txn.notes && (
                                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                                    {txn.notes}
                                  </p>
                                )}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-muted border border-border text-foreground inline-flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-primary" />
                                  {txn.category?.name || "Uncategorized"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                {isIncome ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" />
                                    INCOME
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-destructive/10 border border-destructive/30 text-destructive inline-flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    EXPENSE
                                  </span>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                                <span
                                  className={
                                    isIncome
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-destructive"
                                  }
                                >
                                  {isIncome ? "+" : "-"}
                                  {formatCurrency(txn.amount)}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      setTransactionToEdit(txn);
                                      setIsModalOpen(true);
                                    }}
                                    className="h-8 w-8 min-h-[36px] min-w-[36px] p-0 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg"
                                    aria-label={`Edit transaction with ${txn.merchantName || "payee"}`}
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={deletingId === txn.id}
                                    onClick={() => setTransactionToDelete(txn)}
                                    className="h-8 w-8 min-h-[36px] min-w-[36px] p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                    aria-label={`Delete transaction with ${txn.merchantName || "payee"}`}
                                  >
                                    {deletingId === txn.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* Pagination Controls */}
              {/* ------------------------------------------------------------- */}
              {!isLoading && transactions.length > 0 && (
                <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                  <span>
                    Showing {transactions.length} of {pagination.totalCount} records (Page {pagination.page} of {pagination.totalPages || 1})
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page <= 1}
                      onClick={() => fetchTransactions(pagination.page - 1)}
                      className="border-border bg-background text-foreground hover:bg-muted min-h-[38px] px-3 font-medium"
                      aria-label="Go to previous page"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Previous
                    </Button>
                    <span className="px-2 font-mono font-medium">
                      {pagination.page} / {pagination.totalPages || 1}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => fetchTransactions(pagination.page + 1)}
                      className="border-border bg-background text-foreground hover:bg-muted min-h-[38px] px-3 font-medium"
                      aria-label="Go to next page"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Add / Edit Transaction Modal (Radix Primitive) */}
      <AddEditTransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTransactionToEdit(null);
        }}
        onSuccess={() => fetchTransactions(pagination.page)}
        availableCategories={categories}
        transactionToEdit={transactionToEdit}
      />

      {/* Delete Transaction Confirmation Dialog (ConfirmDialog Primitive) */}
      <ConfirmDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setTransactionToDelete(null);
            setDeleteError(null);
          }
        }}
        title="Delete Transaction"
        description="Are you sure you want to permanently delete this transaction record?"
        variant="destructive"
        confirmText="Delete Record"
        cancelText="Cancel"
        loading={!!deletingId}
        error={deleteError}
        onConfirm={handleConfirmDelete}
        details={
          transactionToDelete && (
            <div className="space-y-1">
              <div className="flex justify-between items-center text-foreground font-semibold">
                <span>{transactionToDelete.merchantName || "Unspecified Payee"}</span>
                <span
                  className={
                    transactionToDelete.type === "INCOME"
                      ? "text-emerald-600 dark:text-emerald-400 font-mono"
                      : "text-destructive font-mono"
                  }
                >
                  {transactionToDelete.type === "INCOME" ? "+" : "-"}
                  {formatCurrency(transactionToDelete.amount)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Category: {transactionToDelete.category?.name || "Uncategorized"} • {formatDate(transactionToDelete.transactionDate)}
              </p>
            </div>
          )
        }
      />
    </div>
  );
}
