"use client";

import Link from "next/link";
import { Wallet, Globe, ArrowUpRight } from "lucide-react";

export function LandingFooter() {
  const handleScrollTo = (id: string) => {
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer suppressHydrationWarning className="border-t border-border/80 bg-card transition-colors">
      <div suppressHydrationWarning className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="md:col-span-6 space-y-4">
            <Link
              href="/"
              suppressHydrationWarning
              className="flex items-center gap-2.5 group inline-flex"
              aria-label="Personal Finance Manager Home"
            >
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">
                Finance<span className="text-primary">Manager</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md font-body">
              A production-ready personal finance management workspace. Track your daily
              cashflow, enforce monthly category budgets, and achieve your milestone savings goals
              with total precision.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Product
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <a
                  href="#features"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo("#features");
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo("#how-it-works");
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#preview"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo("#preview");
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  Application Preview
                </a>
              </li>
              <li>
                <a
                  href="#benefits"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollTo("#benefits");
                  }}
                  className="hover:text-foreground transition-colors"
                >
                  Benefits
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Currency Info */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
              Get Started
            </p>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <span>Create Account</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground transition-colors flex items-center gap-1">
                  <span>Sign In</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>

            <div className="pt-2">
              <p className="text-[11px] font-semibold text-foreground flex items-center gap-1.5 mb-1">
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Supported Currencies</span>
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                ETB (Br), USD ($), EUR (€), GBP (£), JPY (¥)
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Status */}
        <div suppressHydrationWarning className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Personal Finance Manager. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px]">System Status: Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
