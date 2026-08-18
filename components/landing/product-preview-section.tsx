"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  CreditCard,
  PieChart,
  PiggyBank,
  LineChart,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  AlertOctagon,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Tag,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const TABS = [
  { id: "dashboard", label: "Dashboard Hub", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions Ledger", icon: CreditCard },
  { id: "budgets", label: "Budgets & Alerts", icon: PieChart },
  { id: "savings", label: "Savings Goals", icon: PiggyBank },
  { id: "analytics", label: "Trends & Analytics", icon: LineChart },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ProductPreviewSection() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");

  return (
    <section
      id="preview"
      aria-labelledby="preview-heading"
      suppressHydrationWarning
      className="py-16 md:py-24 border-t border-border/60 bg-muted/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Application Preview</span>
          </div>
          <h2
            id="preview-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight"
          >
            A unified workspace built for financial discipline
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-body">
            Explore the actual screens and workflows designed to give you complete financial visibility.
          </p>
        </div>

        {/* Tab Selector Capsule */}
        <div className="flex justify-center">
          <div
            role="tablist"
            aria-label="Application preview modules"
            className="inline-flex flex-wrap items-center justify-center p-1.5 bg-card border border-border rounded-2xl shadow-sm gap-1 max-w-full"
          >
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer min-h-[40px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Screen Canvas Container */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Top Mock Window Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-border text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-warning/60" />
                <span className="w-3 h-3 rounded-full bg-income/60" />
                <span className="ml-2 font-mono text-[11px] text-muted-foreground hidden sm:inline">
                  FinanceManager • Production Interface
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <Badge variant="default" className="text-[10px]">
                  Preferred Currency: ETB (Br)
                </Badge>
              </div>
            </div>

            {/* TAB 1: DASHBOARD HUB */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-in fade-in-50 duration-300">
                {/* Net Balance Hero Banner */}
                <div className="p-6 rounded-2xl bg-muted/40 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Total Net Balance
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-income font-mono tabular-nums">
                      +Br 24,580.00
                    </div>
                    <p className="text-xs text-muted-foreground font-body">
                      Across all tracked accounts and cash reserves
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="income" className="font-mono text-xs py-1 px-2.5">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />
                      +18.4% Monthly Net
                    </Badge>
                  </div>
                </div>

                {/* 3 Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-xs text-muted-foreground">Monthly Income</span>
                    <p className="text-lg font-bold text-income font-mono tabular-nums">
                      +Br 32,400.00
                    </p>
                    <span className="text-[11px] text-muted-foreground">2 regular sources</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-xs text-muted-foreground">Monthly Expenses</span>
                    <p className="text-lg font-bold text-expense font-mono tabular-nums">
                      -Br 7,820.00
                    </p>
                    <span className="text-[11px] text-muted-foreground">14 total transactions</span>
                  </div>

                  <div className="p-4 rounded-xl bg-card border border-border space-y-1">
                    <span className="text-xs text-muted-foreground">Savings Rate</span>
                    <p className="text-lg font-bold text-primary font-mono tabular-nums">
                      75.9%
                    </p>
                    <span className="text-[11px] text-muted-foreground">Well above 20% target</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TRANSACTIONS LEDGER */}
            {activeTab === "transactions" && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-foreground">Transactions Ledger</h4>
                    <p className="text-xs text-muted-foreground">Searchable history with type dual-coding</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    Showing 3 of 48
                  </Badge>
                </div>

                {/* Mock Ledger Rows */}
                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-income/10 border border-income/20 text-income shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">Monthly Tech Salary</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">Income</span>
                          <span>Aug 15, 2026</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-income font-mono tabular-nums shrink-0">
                      +Br 32,400.00
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-expense/10 border border-expense/20 text-expense shrink-0">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">Fresh Market Groceries</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">Food & Groceries</span>
                          <span>Aug 14, 2026</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-expense font-mono tabular-nums shrink-0">
                      -Br 2,450.00
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg bg-expense/10 border border-expense/20 text-expense shrink-0">
                        <ArrowDownLeft className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">High-Speed Internet Fiber</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="inline-block px-1.5 py-0.5 rounded bg-muted text-[10px] font-medium">Utilities</span>
                          <span>Aug 10, 2026</span>
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-expense font-mono tabular-nums shrink-0">
                      -Br 1,200.00
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: BUDGETS & WARNINGS */}
            {activeTab === "budgets" && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-foreground">Monthly Category Budgets</h4>
                    <p className="text-xs text-muted-foreground">3-stage threshold warnings: Normal, Warning (80%), Exceeded (100%)</p>
                  </div>
                  <Badge variant="warning" className="font-mono text-xs">
                    1 Warning Active
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Warning Budget */}
                  <div className="p-4 rounded-xl bg-warning/10 border border-warning/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        Dining & Takeout
                      </span>
                      <Badge variant="warning" className="text-[10px] font-bold">
                        82.0% Warning
                      </Badge>
                    </div>
                    <Progress value={82} className="h-2 bg-warning/20" indicatorClassName="bg-warning" />
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>Spent: <strong className="text-warning">Br 3,280.00</strong></span>
                      <span>Limit: Br 4,000.00</span>
                    </div>
                  </div>

                  {/* Healthy Budget */}
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-sm flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-income" />
                        Transportation & Fuel
                      </span>
                      <Badge variant="income" className="text-[10px] font-bold">
                        35.0% On Track
                      </Badge>
                    </div>
                    <Progress value={35} className="h-2" indicatorClassName="bg-income" />
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>Spent: <strong className="text-foreground">Br 1,050.00</strong></span>
                      <span>Limit: Br 3,000.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: SAVINGS GOALS */}
            {activeTab === "savings" && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-foreground">Savings Goals & Targets</h4>
                    <p className="text-xs text-muted-foreground">Milestone tracking and quick contribution logging</p>
                  </div>
                  <Badge variant="default" className="font-mono text-xs">
                    2 Active Goals
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
                          <Target className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Emergency Fund</p>
                          <p className="text-[10px] text-muted-foreground">Target: Dec 31, 2026</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-primary font-mono">68.0%</span>
                    </div>
                    <Progress value={68} className="h-2" />
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>Saved: <strong className="text-foreground">Br 68,000.00</strong></span>
                      <span>Target: Br 100,000.00</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          <PiggyBank className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Home Downpayment</p>
                          <p className="text-[10px] text-muted-foreground">Target: June 30, 2027</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-income font-mono">42.5%</span>
                    </div>
                    <Progress value={42.5} className="h-2" indicatorClassName="bg-emerald-500" />
                    <div className="flex justify-between text-xs font-mono text-muted-foreground">
                      <span>Saved: <strong className="text-foreground">Br 212,500.00</strong></span>
                      <span>Target: Br 500,000.00</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ANALYTICS & TRENDS */}
            {activeTab === "analytics" && (
              <div className="space-y-4 animate-in fade-in-50 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-base font-bold text-foreground">Expense Analytics & Distribution</h4>
                    <p className="text-xs text-muted-foreground">Categorized proportions and historical cashflow trends</p>
                  </div>
                  <Badge variant="outline" className="font-mono text-xs">
                    Last 6 Months
                  </Badge>
                </div>

                <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border/80">
                  <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                    <span>Category Breakdown</span>
                    <span className="font-mono">Total Spent: Br 7,820.00</span>
                  </div>

                  <div className="flex h-3 w-full rounded-full overflow-hidden gap-1">
                    <div className="bg-primary h-full w-[42%]" title="Housing (42%)" />
                    <div className="bg-emerald-500 h-full w-[31%]" title="Food & Groceries (31%)" />
                    <div className="bg-amber-500 h-full w-[15%]" title="Utilities (15%)" />
                    <div className="bg-rose-500 h-full w-[12%]" title="Entertainment (12%)" />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <p className="text-[10px] text-muted-foreground">Housing</p>
                      <p className="font-bold text-foreground font-mono">Br 3,284 (42%)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <p className="text-[10px] text-muted-foreground">Food & Groceries</p>
                      <p className="font-bold text-foreground font-mono">Br 2,424 (31%)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <p className="text-[10px] text-muted-foreground">Utilities</p>
                      <p className="font-bold text-foreground font-mono">Br 1,173 (15%)</p>
                    </div>
                    <div className="p-2 rounded-lg bg-card border border-border/50">
                      <p className="text-[10px] text-muted-foreground">Entertainment</p>
                      <p className="font-bold text-foreground font-mono">Br 938 (12%)</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
