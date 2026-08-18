import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ProductPreviewSection } from "@/components/landing/product-preview-section";
import { BenefitsSection } from "@/components/landing/benefits-section";
import { CTASection } from "@/components/landing/cta-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "Personal Finance Manager — Disciplined Financial Clarity",
  description:
    "Track daily cashflow, enforce category budgets with proactive threshold warnings, and build milestone savings with support for Ethiopian Birr (Br), USD, EUR, and GBP.",
};

export default function HomePage() {
  return (
    <div
      suppressHydrationWarning
      className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary transition-colors duration-200 overflow-x-hidden w-full"
    >
      {/* Accessible Skip Link for Keyboard Navigation */}
      <a
        href="#main-content"
        suppressHydrationWarning
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:font-bold focus:rounded-lg focus:shadow-xl focus:ring-2 focus:ring-primary focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Public Marketing Navigation Bar */}
      <LandingNavbar />

      {/* Main Public Content */}
      <main id="main-content" suppressHydrationWarning className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <ProductPreviewSection />
        <BenefitsSection />
        <CTASection />
      </main>

      {/* Public Footer */}
      <LandingFooter />
    </div>
  );
}
