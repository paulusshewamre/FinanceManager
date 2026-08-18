"use client";

import Link from "next/link";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  LogIn,
  ShieldCheck,
  Zap,
  Globe,
  PiggyBank,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-heading"
      suppressHydrationWarning
      className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 lg:pt-20 lg:pb-32"
    >
      {/* Background Subtle Ambient Glow (pure CSS, responsive, no overflow) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
      >
        <div className="relative left-[calc(50%-11rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/20 to-emerald-500/10 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Value Proposition & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Disciplined Personal Finance Workspace</span>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.15]"
            >
              Master your money with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-sky-400 to-emerald-400">
                clarity and precision
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl font-body">
              Track daily cashflow, enforce category budgets with proactive threshold
              warnings, and build milestone savings — supporting{" "}
              <span className="text-foreground font-semibold">Ethiopian Birr (Br)</span>,{" "}
              <span className="text-foreground font-semibold">USD ($)</span>,{" "}
              <span className="text-foreground font-semibold">EUR (€)</span>, and{" "}
              <span className="text-foreground font-semibold">GBP (£)</span>.
            </p>

            {/* Primary & Secondary Call to Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Link
                href="/register"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-6 rounded-xl font-bold shadow-md bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2"
                )}
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-12 px-6 rounded-xl font-semibold border-border/80 hover:bg-muted/70 text-foreground transition-all active:scale-[0.98] text-sm sm:text-base flex items-center justify-center gap-2"
                )}
              >
                <LogIn className="w-4 h-4 text-muted-foreground" />
                <span>Sign In</span>
              </Link>
            </div>

            {/* Key Value Micro-Pills */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Isolated & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                <span>3-Second Glance Hub</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <span>Multi-Currency Ready</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Product Snapshot */}
          <div className="lg:col-span-6 w-full">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Outer Glow & Card Container */}
              <div className="rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-4 sm:p-6 space-y-4 ring-1 ring-border/50">
                {/* Visual Header / Mock Top Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 text-primary">
                      <Wallet className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">Financial Overview</p>
                      <p className="text-[10px] text-muted-foreground font-mono">Live Demo Snapshot</p>
                    </div>
                  </div>
                  <Badge variant="income" className="text-[10px] font-mono font-bold">
                    ● Active Ledger
                  </Badge>
                </div>

                {/* Net Balance Hero Display */}
                <div className="p-4 sm:p-5 rounded-xl bg-muted/40 border border-border/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total Net Balance
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-income font-mono">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +18.4% this month
                    </span>
                  </div>

                  <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-income font-mono tabular-nums">
                    +Br 24,580.00
                  </div>

                  {/* Cashflow sub-tiles */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground">Monthly Income</p>
                      <p className="text-xs sm:text-sm font-bold text-income font-mono tabular-nums truncate">
                        +Br 32,400
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground">Monthly Expense</p>
                      <p className="text-xs sm:text-sm font-bold text-expense font-mono tabular-nums truncate">
                        -Br 7,820
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground">Savings Rate</p>
                      <p className="text-xs sm:text-sm font-bold text-primary font-mono tabular-nums truncate">
                        75.9%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Proactive Budget Alert Preview */}
                <div className="p-3.5 rounded-xl bg-warning/10 border border-warning/30 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-warning">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Dining & Food Budget Alert</span>
                    </div>
                    <span className="font-mono font-bold text-warning text-[11px]">82.0%</span>
                  </div>
                  <Progress value={82} className="h-1.5 bg-warning/20" indicatorClassName="bg-warning" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>Spent: Br 3,280.00</span>
                    <span>Limit: Br 4,000.00</span>
                  </div>
                </div>

                {/* Active Savings Milestone Preview */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <PiggyBank className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Emergency Savings Fund</span>
                    </div>
                    <span className="font-mono font-bold text-primary text-[11px]">68.0%</span>
                  </div>
                  <Progress value={68} className="h-1.5" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>Accumulated: Br 68,000.00</span>
                    <span>Target: Br 100,000.00</span>
                  </div>
                </div>

                {/* Recent Transaction Item Snippets */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Activity
                  </p>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-income/10 text-income border border-income/20">
                        <ArrowUpRight className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-foreground truncate text-[11px]">
                        Monthly Salary
                      </span>
                    </div>
                    <span className="font-mono font-bold text-income tabular-nums text-[11px]">
                      +Br 32,400.00
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/40 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1 rounded-md bg-expense/10 text-expense border border-expense/20">
                        <ArrowDownLeft className="w-3 h-3" />
                      </div>
                      <span className="font-medium text-foreground truncate text-[11px]">
                        Supermarket & Supplies
                      </span>
                    </div>
                    <span className="font-mono font-bold text-expense tabular-nums text-[11px]">
                      -Br 2,450.00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
