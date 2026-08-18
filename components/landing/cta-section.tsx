"use client";

import Link from "next/link";
import { ArrowRight, LogIn, Sparkles, ShieldCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section
      aria-labelledby="cta-heading"
      suppressHydrationWarning
      className="py-16 md:py-24 border-t border-border/60 bg-muted/20 relative overflow-hidden"
    >
      {/* Background Accent Mesh */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-20 -z-10 transform-gpu overflow-hidden blur-3xl"
      >
        <div className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary/20 to-emerald-500/10 opacity-30 sm:left-[calc(50%+20rem)] sm:w-[60rem]" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Start Managing Your Finances</span>
          </div>

          <h2
            id="cta-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight"
          >
            Take control of your financial future today
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-body">
            Track daily transactions, establish disciplined category budgets, and achieve your
            milestone savings goals from a single, unified workspace.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/register"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 px-8 rounded-xl font-bold shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2"
            )}
          >
            <span>Create Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "h-12 px-8 rounded-xl font-semibold border-border/80 hover:bg-muted/80 text-foreground transition-all active:scale-[0.98] w-full sm:w-auto flex items-center justify-center gap-2"
            )}
          >
            <LogIn className="w-4 h-4 text-muted-foreground" />
            <span>Log In</span>
          </Link>
        </div>

        {/* Micro-guarantees */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Free to use & instant setup
          </span>
          <span className="hidden sm:inline">•</span>
          <span>No credit card required</span>
          <span className="hidden sm:inline">•</span>
          <span>Supports Light & Dark modes</span>
        </div>
      </div>
    </section>
  );
}
