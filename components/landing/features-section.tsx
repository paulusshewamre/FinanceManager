"use client";

import {
  CreditCard,
  PieChart,
  PiggyBank,
  LineChart,
  Globe,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  Target,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: CreditCard,
    title: "Track Every Transaction",
    tagline: "Comprehensive Income & Expense Ledger",
    description:
      "Record every transaction with merchant details, category taxonomy, and notes. Full support for backdating entries with instant balance updates.",
    preview: (
      <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="p-1 rounded-md bg-income/10 text-income border border-income/20">
              <ArrowUpRight className="w-3 h-3" />
            </span>
            <span className="font-medium text-foreground truncate text-[11px]">Client Invoice</span>
          </div>
          <span className="font-mono font-bold text-income tabular-nums text-[11px]">+Br 12,500.00</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="p-1 rounded-md bg-expense/10 text-expense border border-expense/20">
              <ArrowDownLeft className="w-3 h-3" />
            </span>
            <span className="font-medium text-foreground truncate text-[11px]">Office Supplies</span>
          </div>
          <span className="font-mono font-bold text-expense tabular-nums text-[11px]">-Br 840.00</span>
        </div>
      </div>
    ),
  },
  {
    icon: PieChart,
    title: "Control Category Budgets",
    tagline: "Proactive Warning Threshold Engine",
    description:
      "Establish monthly category spending caps. Dual-coded warning indicators notify you at 80% capacity before you overspend, with red alerts at 100%.",
    preview: (
      <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/30 space-y-2 text-xs">
        <div className="flex items-center justify-between font-semibold text-warning text-[11px]">
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Dining & Takeout
          </span>
          <span className="font-mono">82% (Warning)</span>
        </div>
        <div className="w-full bg-warning/20 h-1.5 rounded-full overflow-hidden">
          <div className="bg-warning h-full w-[82%]" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>Spent: Br 3,280</span>
          <span>Cap: Br 4,000</span>
        </div>
      </div>
    ),
  },
  {
    icon: PiggyBank,
    title: "Build Milestone Savings",
    tagline: "Visual Goal & Target Progress",
    description:
      "Set structured savings targets, assign target dates, and record contributions with quick-fill presets and milestone completion celebrations.",
    preview: (
      <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-primary" />
            Emergency Fund
          </span>
          <span className="font-mono font-bold text-primary">68%</span>
        </div>
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div className="bg-primary h-full w-[68%]" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
          <span>Br 68,000 / Br 100,000</span>
          <span>Target: Dec 2026</span>
        </div>
      </div>
    ),
  },
  {
    icon: LineChart,
    title: "Visual Financial Analytics",
    tagline: "Spending Distribution & Trends",
    description:
      "Spot spending patterns instantly. Explore categorized expense distributions and analyze monthly income versus expense trends across multiple periods.",
    preview: (
      <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
          Top Expense Distribution
        </p>
        <div className="flex h-2 w-full rounded-full overflow-hidden gap-0.5">
          <div className="bg-primary h-full w-[45%]" title="Housing (45%)" />
          <div className="bg-emerald-500 h-full w-[25%]" title="Food (25%)" />
          <div className="bg-amber-500 h-full w-[18%]" title="Utilities (18%)" />
          <div className="bg-rose-500 h-full w-[12%]" title="Other (12%)" />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary" /> Housing</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Food</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Utilities</span>
        </div>
      </div>
    ),
  },
  {
    icon: Globe,
    title: "Native Multi-Currency",
    tagline: "Ethiopian Birr & Global Currencies",
    description:
      "Designed with first-class support for Ethiopian Birr (Br), US Dollar ($), Euro (€), British Pound (£), and Japanese Yen (¥) with centralized formatting.",
    preview: (
      <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60 text-xs">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Supported Currency Standards
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="default" className="font-mono text-[11px] py-0.5 px-2">
            Br ETB
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px] py-0.5 px-2">
            $ USD
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px] py-0.5 px-2">
            € EUR
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px] py-0.5 px-2">
            £ GBP
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px] py-0.5 px-2">
            ¥ JPY
          </Badge>
        </div>
      </div>
    ),
  },
  {
    icon: LayoutDashboard,
    title: "3-Second Financial Clarity",
    tagline: "Instant Executive Glance",
    description:
      "Understand your full financial position the moment you open the app. Net balance, active month cashflow, savings rate, and urgent alerts in one place.",
    preview: (
      <div className="mt-3 p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">Net Position</span>
          <span className="text-[10px] font-bold text-income font-mono">+Healthy</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-border/40 font-mono">
          <span className="text-xs font-bold text-income">+Br 24,580.00</span>
          <span className="text-[10px] text-muted-foreground">Savings: 75.9%</span>
        </div>
      </div>
    ),
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      aria-labelledby="features-heading"
      suppressHydrationWarning
      className="py-16 md:py-24 lg:py-32 bg-muted/20 border-y border-border/60 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Core Capabilities</span>
          </div>
          <h2
            id="features-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight"
          >
            Everything you need to master your personal finances
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-body">
            Built with professional financial rigor, thoughtful safeguards, and zero unnecessary complexity.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="bg-card/90 border-border/80 hover:border-primary/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between"
              >
                <CardContent className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground tracking-tight">
                        {feature.title}
                      </h3>
                      <p className="text-xs font-semibold text-primary mt-0.5">
                        {feature.tagline}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                      {feature.description}
                    </p>
                  </div>

                  {/* Micro-preview component */}
                  {feature.preview}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
