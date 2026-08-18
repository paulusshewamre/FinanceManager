"use client";

import { PlusCircle, Target, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    step: "01",
    icon: PlusCircle,
    title: "Log Your Transactions",
    description:
      "Record daily income and expense transactions in seconds. Organize by category, add merchant notes, and backdate historical records effortlessly.",
    badge: "10-Second Entry",
  },
  {
    step: "02",
    icon: Target,
    title: "Set Budgets & Savings Targets",
    description:
      "Define monthly spending caps for your expense categories and create milestone savings goals with custom target dates and contribution plans.",
    badge: "Disciplined Goals",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Understand Your Progress",
    description:
      "Monitor your net balance in real time. Receive proactive alerts when approaching budget limits and watch your savings goals advance.",
    badge: "Complete Awareness",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      suppressHydrationWarning
      className="py-16 md:py-24 border-t border-border/60 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span>Simple 3-Step Process</span>
          </div>
          <h2
            id="how-it-works-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight"
          >
            How Personal Finance Manager Works
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-body">
            Get from zero to complete financial clarity in three straightforward steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {STEPS.map((stepItem, idx) => {
            const Icon = stepItem.icon;
            return (
              <div key={idx} className="relative group">
                <Card className="h-full bg-card/90 border-border/80 group-hover:border-primary/40 group-hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6 space-y-4">
                    {/* Top Row: Step Number & Icon */}
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-extrabold text-primary/30 group-hover:text-primary transition-colors font-mono">
                        {stepItem.step}
                      </span>
                      <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Step Title & Badge */}
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground uppercase tracking-wider">
                        {stepItem.badge}
                      </span>
                      <h3 className="text-lg font-bold text-foreground tracking-tight">
                        {stepItem.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                      {stepItem.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
