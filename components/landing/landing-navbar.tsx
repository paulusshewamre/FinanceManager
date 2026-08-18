"use client";

import { useState } from "react";
import Link from "next/link";
import { Wallet, Menu, X, ArrowRight, LogIn, LayoutDashboard } from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { LandingThemeToggle } from "@/components/landing/theme-toggle";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Preview", href: "#preview" },
  { label: "Benefits", href: "#benefits" },
] as const;

export function LandingNavbar() {
  const { data: session } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleScrollTo = (id: string) => {
    setIsDrawerOpen(false);
    const element = document.querySelector(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/85 backdrop-blur-md transition-colors"
        suppressHydrationWarning
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl py-1"
              aria-label="Personal Finance Manager Home"
            >
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-base sm:text-lg text-foreground tracking-tight whitespace-nowrap">
                Finance<span className="text-primary">Manager</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Marketing Navigation"
            className="hidden lg:flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50 shadow-xs"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo(link.href);
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Action Island */}
          <div className="flex items-center gap-2.5">
            {/* Theme Switcher */}
            <LandingThemeToggle />

            {/* Authenticated vs Guest CTAs (Desktop) */}
            <div className="hidden sm:flex items-center gap-2" suppressHydrationWarning>
              {session?.user ? (
                <Link
                  href="/dashboard"
                  suppressHydrationWarning
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "font-semibold shadow-xs flex items-center gap-1.5"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    suppressHydrationWarning
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5"
                    )}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In</span>
                  </Link>

                  <Link
                    href="/register"
                    suppressHydrationWarning
                    className={cn(
                      buttonVariants({ size: "sm" }),
                      "font-semibold shadow-xs flex items-center gap-1.5"
                    )}
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <Button
              variant="ghost"
              size="icon"
              suppressHydrationWarning
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
              aria-label="Open mobile menu"
              aria-expanded={isDrawerOpen}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh] bg-card border-border text-foreground p-0 flex flex-col focus-visible:outline-hidden">
          <DrawerHeader className="p-4 pb-3 border-b border-border text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <DrawerTitle className="text-base font-bold text-foreground">
                    Finance<span className="text-primary">Manager</span>
                  </DrawerTitle>
                  <DrawerDescription className="text-xs text-muted-foreground">
                    Disciplined financial clarity
                  </DrawerDescription>
                </div>
              </div>

              <DrawerClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* Nav items list */}
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollTo(link.href);
                }}
                className="flex items-center justify-between p-3 rounded-xl text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </a>
            ))}
          </div>

          {/* Drawer Footer with Actions */}
          <div className="p-4 pt-3 border-t border-border bg-card/90 space-y-2" suppressHydrationWarning>
            {session?.user ? (
              <Link
                href="/dashboard"
                suppressHydrationWarning
                onClick={() => setIsDrawerOpen(false)}
                className={cn(
                  buttonVariants({}),
                  "w-full justify-center min-h-[44px] font-semibold flex items-center gap-2"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            ) : (
              <div className="grid grid-cols-2 gap-2" suppressHydrationWarning>
                <Link
                  href="/login"
                  suppressHydrationWarning
                  onClick={() => setIsDrawerOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-center min-h-[44px] font-medium flex items-center gap-1.5"
                  )}
                >
                  <LogIn className="w-4 h-4" />
                  Log In
                </Link>
                <Link
                  href="/register"
                  suppressHydrationWarning
                  onClick={() => setIsDrawerOpen(false)}
                  className={cn(
                    buttonVariants({}),
                    "w-full justify-center min-h-[44px] font-semibold flex items-center justify-center"
                  )}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
