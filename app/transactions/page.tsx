"use client";

import { useState, useEffect, useCallback } from "react";
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
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Calendar,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Tag,
  Store,
} from "lucide-react";
import {
  AddEditTransactionModal,
  type CategoryItem,
} from "@/components/transactions/add-edit-transaction-modal";

interface TransactionItem {
  id: string;
  categoryId: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  transactionDate: string;
  merchantName?: string | null;
  notes?: string | null;
  category: {
    id: string;
    name: string;
    type: "INCOME" | "EXPENSE";
    isSystemDefault: boolean;
  };
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export default function TransactionsPage() {
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

  // Modal & Action States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction record?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json();
        alert(body.error || "Failed to delete transaction");
        return;
      }
      fetchTransactions(pagination.page);
    } catch (err: any) {
      alert(err.message || "Error deleting transaction");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#0f1418] text-[#dee3e8]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-[#1b2024] rounded-2xl border border-[#303539] shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#38bdf8]/10 border border-[#38bdf8]/20 text-[#38bdf8]">
                Ledger Domain Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#dee3e8] tracking-tight">
              Transactions Ledger
            </h1>
            <p className="text-sm text-[#94a3b8]">
              Monitor, filter, and backdate income and expense cashflows across your personal ledger.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => {
                setTransactionToEdit(null);
                setIsModalOpen(true);
              }}
              className="bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold px-4 py-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Log Transaction
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8]">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Search Bar */}
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#94a3b8]" />
                <Input
                  type="text"
                  placeholder="Search merchant or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-[#0f1418] border-[#303539] focus:border-[#38bdf8] text-[#dee3e8] text-xs"
                />
              </div>

              {/* Type Filter */}
              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full h-10 bg-[#0f1418] border border-[#303539] rounded-md px-3 text-xs text-[#dee3e8] focus:border-[#38bdf8] outline-none"
                >
                  <option value="ALL">All Types</option>
                  <option value="EXPENSE">Expense Only</option>
                  <option value="INCOME">Income Only</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-10 bg-[#0f1418] border border-[#303539] rounded-md px-3 text-xs text-[#dee3e8] focus:border-[#38bdf8] outline-none"
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("ALL");
                    setCategoryFilter("ALL");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="w-full border-[#303539] bg-[#0f1418] text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] text-xs"
                >
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Date Range Row */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 border-t border-[#303539]/50 text-xs text-[#94a3b8]">
              <span className="flex items-center gap-1.5 font-medium shrink-0">
                <Calendar className="w-3.5 h-3.5 text-[#38bdf8]" />
                Date Range Filter:
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0f1418] border-[#303539] text-[#dee3e8] text-xs"
                />
                <span>to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0f1418] border-[#303539] text-[#dee3e8] text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ledger Table Section */}
        <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8] shadow-xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b border-[#303539]/60">
            <div>
              <CardTitle className="text-base font-bold text-[#dee3e8]">
                Recorded Cashflows ({pagination.totalCount})
              </CardTitle>
              <CardDescription className="text-xs text-[#94a3b8]">
                Page {pagination.page} of {pagination.totalPages || 1}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchTransactions(pagination.page)}
              disabled={isLoading}
              className="border-[#303539] bg-[#0f1418] text-[#94a3b8] hover:text-[#dee3e8]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#38bdf8]" />
                <p className="text-xs text-[#94a3b8]">Loading ledger entries...</p>
              </div>
            ) : error ? (
              <div className="p-6 text-center space-y-3 text-rose-400 text-xs">
                <AlertCircle className="w-6 h-6 mx-auto" />
                <p>{error}</p>
                <Button size="sm" variant="outline" onClick={() => fetchTransactions(1)}>
                  Retry
                </Button>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center space-y-3 text-[#94a3b8] text-xs">
                <Filter className="w-8 h-8 mx-auto text-[#303539]" />
                <p>No transaction records found matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0f1418]/60 border-b border-[#303539] text-[#aeb9d0] uppercase tracking-wider font-semibold">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Merchant & Notes</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#303539]/40">
                    {transactions.map((txn) => (
                      <tr
                        key={txn.id}
                        className="hover:bg-[#22272b]/50 transition-colors group"
                      >
                        <td className="py-3.5 px-4 text-[#94a3b8] whitespace-nowrap font-medium">
                          {formatDate(txn.transactionDate)}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-[#dee3e8] flex items-center gap-1.5">
                            <Store className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
                            <span className="truncate">
                              {txn.merchantName || "Unspecified Payee"}
                            </span>
                          </div>
                          {txn.notes && (
                            <p className="text-[11px] text-[#94a3b8] truncate mt-0.5">
                              {txn.notes}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0f1418] border border-[#303539] text-[#dee3e8] inline-flex items-center gap-1">
                            <Tag className="w-3 h-3 text-[#38bdf8]" />
                            {txn.category?.name || "Uncategorized"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {txn.type === "INCOME" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 inline-flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              INCOME
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400 inline-flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              EXPENSE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono font-bold text-sm">
                          <span
                            className={
                              txn.type === "INCOME"
                                ? "text-emerald-400"
                                : "text-rose-400"
                            }
                          >
                            {txn.type === "INCOME" ? "+" : "-"}
                            ${Number(txn.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
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
                              className="h-7 w-7 p-0 text-[#94a3b8] hover:text-[#38bdf8] hover:bg-[#22272b]"
                              title="Edit transaction"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={deletingId === txn.id}
                              onClick={() => handleDelete(txn.id)}
                              className="h-7 w-7 p-0 text-[#94a3b8] hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete transaction"
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
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!isLoading && transactions.length > 0 && (
              <div className="p-4 border-t border-[#303539] flex items-center justify-between text-xs text-[#94a3b8]">
                <span>
                  Showing {transactions.length} of {pagination.totalCount} records
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchTransactions(pagination.page - 1)}
                    className="border-[#303539] bg-[#0f1418] text-[#dee3e8] hover:bg-[#22272b]"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchTransactions(pagination.page + 1)}
                    className="border-[#303539] bg-[#0f1418] text-[#dee3e8] hover:bg-[#22272b]"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Add / Edit Transaction Modal */}
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
    </div>
  );
}
