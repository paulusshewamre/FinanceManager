"use client";

import {
  ShieldCheck,
  Eye,
  Sliders,
  BellRing,
  Award,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const BENEFITS = [
  {
    icon: Eye,
    title: "Unambiguous Financial Clarity",
    description:
      "Every monetary figure is rendered with explicit two-decimal precision and tabular numbers. Eliminate financial guesswork and know exactly where you stand.",
  },
  {
    icon: BellRing,
    title: "Proactive Overspending Prevention",
    description:
      "Automated warning badges highlight categories at 80% spending capacity before overspending occurs, helping you stay disciplined without stress.",
  },
  {
    icon: Award,
    title: "Goal-Driven Milestone Progress",
    description:
      "Transform abstract savings goals into concrete milestone targets. Track contributions with visual completion feedback and progress celebrations.",
  },
  {
    icon: Sliders,
    title: "Tailored to Your Regional Currency",
    description:
      "Seamlessly configure your preferred currency standard — including Ethiopian Birr (Br), USD ($), EUR (€), and GBP (£) — across all summaries and ledgers.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy & Focused Utility",
    description:
      "No third-party advertisements, no unsolicited upsells, and no distracting financial jargon. Just clean, reliable, and private money management.",
  },
  {
    icon: Layers,
    title: "Consistent Multi-Device Experience",
    description:
      "Engineered to adapt flawlessly from mobile touch screens with thumb-friendly controls to multi-column desktop monitors with dark and light themes.",
  },
];

export function BenefitsSection() {
  return (
    <section
      id="benefits"
      aria-labelledby="benefits-heading"
      suppressHydrationWarning
      className="py-16 md:py-24 border-t border-border/60 bg-background"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product Benefits</span>
          </div>
          <h2
            id="benefits-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight"
          >
            Built for clarity, discipline, and complete peace of mind
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground font-body">
            Experience an intentional personal finance workspace that prioritizes your financial health above all else.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={idx}
                className="bg-card/90 border-border/80 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground tracking-tight">
                    {benefit.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-body">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
