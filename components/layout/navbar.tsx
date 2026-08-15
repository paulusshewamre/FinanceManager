"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  LayoutDashboard,
  Tag,
  CreditCard,
  PieChart,
  PiggyBank,
  LineChart,
  Settings,
  Menu,
  X,
  User,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/lib/auth/auth-client";
import { useUserPreferences } from "@/lib/context/user-preferences-context";
import { LogoutButton } from "@/components/layout/logout-button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview, cashflow & activity",
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: CreditCard,
    description: "Ledger & cashflow logs",
  },
  {
    label: "Budgets",
    href: "/budgets",
    icon: PieChart,
    description: "Spending limits & alerts",
  },
  {
    label: "Savings",
    href: "/savings",
    icon: PiggyBank,
    description: "Goals & target milestones",
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: LineChart,
    description: "Trends & expense distribution",
  },
  {
    label: "Categories",
    href: "/categories",
    icon: Tag,
    description: "Taxonomy & custom types",
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Preferences, currency & profile",
  },
] as const;

// Primary 4 items shown on the mobile bottom navigation bar
const MOBILE_PRIMARY_NAV: readonly NavItem[] = [
  NAV_ITEMS[0], // Dashboard
  NAV_ITEMS[1], // Transactions
  NAV_ITEMS[2], // Budgets
  NAV_ITEMS[3], // Savings
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { displayName } = useUserPreferences();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const isItemActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(href);
  };

  // Derive 2-letter initials for user avatar badge
  const userInitials = useMemo(() => {
    const name = displayName || session?.user?.name || "User";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [displayName, session?.user?.name]);

  // Check if current page is in the "More" drawer menu on mobile
  const isMoreActive =
    !MOBILE_PRIMARY_NAV.some((item) => isItemActive(item.href)) &&
    NAV_ITEMS.some((item) => isItemActive(item.href));

  return (
    <>
      {/* ========================================================================= */}
      {/* Top Application Header (Desktop, Tablet, Mobile) */}
      {/* ========================================================================= */}
      <header
        className="sticky top-0 z-40 w-full border-b border-border/70 bg-card/90 backdrop-blur-md transition-colors"
        suppressHydrationWarning
      >
        <div
          className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 gap-4"
          suppressHydrationWarning
        >
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 shrink-0" suppressHydrationWarning>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary rounded-xl py-1"
              aria-label="Personal Finance Manager Dashboard"
            >
              <div
                className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary group-hover:scale-105 transition-transform"
                suppressHydrationWarning
              >
                <Wallet className="w-5 h-5" />
              </div>
              <span className="font-bold text-base sm:text-lg text-foreground tracking-tight whitespace-nowrap">
                Finance<span className="text-primary">Manager</span>
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation Island (Segmented Capsule) */}
          <nav
            aria-label="Main Navigation"
            className="hidden md:flex items-center gap-0.5 p-1 bg-muted/40 rounded-xl border border-border/50 shadow-xs"
            suppressHydrationWarning
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 lg:px-3 lg:py-1.5 rounded-lg text-xs font-semibold transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                    active
                      ? "bg-background text-foreground shadow-xs border border-border/60 ring-1 ring-primary/20 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      active ? "text-primary stroke-[2.5]" : "text-muted-foreground"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User Profile Capsule & Logout Action */}
          <div className="flex items-center gap-2.5 shrink-0" suppressHydrationWarning>
            {session?.user && (
              <Link
                href="/settings"
                aria-label="View user profile and account settings"
                className="hidden sm:flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-border/60 bg-muted/30 hover:bg-muted/60 hover:border-primary/30 transition-all focus-visible:ring-2 focus-visible:ring-primary group"
                suppressHydrationWarning
              >
                <div
                  className="w-7 h-7 rounded-lg bg-gradient-to-tr from-primary/30 to-primary/10 border border-primary/30 text-primary font-bold text-xs flex items-center justify-center select-none shadow-xs group-hover:scale-105 transition-transform"
                  suppressHydrationWarning
                >
                  {userInitials}
                </div>
                <div className="flex flex-col text-left" suppressHydrationWarning>
                  <span className="text-xs font-semibold text-foreground truncate max-w-[110px] leading-tight">
                    {displayName || session.user.name || "User"}
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[110px] leading-tight">
                    Settings
                  </span>
                </div>
              </Link>
            )}

            {/* Desktop Logout Button (Clean Icon Button with Tooltip) */}
            <div className="hidden md:block">
              <LogoutButton
                variant="outline"
                showText={false}
                className="h-9 w-9 p-0 min-h-[36px] min-w-[36px] rounded-xl border-border/70 hover:border-destructive/30 hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              />
            </div>

            {/* Mobile Header Menu Button (< 768px) */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDrawerOpen(true)}
              className="md:hidden h-10 w-10 min-h-[44px] min-w-[44px] rounded-xl border border-border bg-background hover:bg-muted text-foreground flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Open mobile navigation menu"
              aria-expanded={isDrawerOpen}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* Mobile Fixed Bottom Navigation Bar (< 768px) */}
      {/* ========================================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom,0px)] shadow-2xl transition-colors"
      >
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
          {MOBILE_PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 px-0.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary relative ${
                  active
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {/* Active Indicator Top Pill */}
                {active && (
                  <span className="absolute top-1 w-8 h-1 bg-primary rounded-full animate-in fade-in zoom-in-50 duration-200" />
                )}
                <Icon className={`w-5 h-5 shrink-0 ${active ? "text-primary scale-110" : ""}`} />
                <span className="text-[10px] tracking-tight truncate max-w-full font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {/* 5th Bottom Nav Item: More / All Navigation Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open more navigation options and user settings"
            aria-expanded={isDrawerOpen}
            className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 px-0.5 rounded-lg transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary relative ${
              isMoreActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {isMoreActive && (
              <span className="absolute top-1 w-8 h-1 bg-primary rounded-full animate-in fade-in zoom-in-50 duration-200" />
            )}
            <Menu className={`w-5 h-5 shrink-0 ${isMoreActive ? "text-primary scale-110" : ""}`} />
            <span className="text-[10px] tracking-tight truncate max-w-full font-medium">
              More
            </span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* Mobile Navigation Drawer Sheet (< 768px) */}
      {/* ========================================================================= */}
      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent className="max-h-[85vh] bg-card border-border text-foreground p-0 flex flex-col focus-visible:outline-hidden">
          <DrawerHeader className="p-4 pb-2 border-b border-border text-left">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl border border-primary/20 text-primary">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <DrawerTitle className="text-base font-bold text-foreground">
                    Navigation Menu
                  </DrawerTitle>
                  <DrawerDescription className="text-xs text-muted-foreground">
                    Access all personal finance manager destinations
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

            {/* User Profile Card */}
            {session?.user && (
              <div className="mt-3 p-3 bg-muted/40 rounded-xl border border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary/30 to-primary/10 border border-primary/30 text-primary flex items-center justify-center font-bold text-xs">
                  {userInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {displayName || session.user.name || "User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
            )}
          </DrawerHeader>

          {/* Full Navigation Links List */}
          <div className="p-4 space-y-1.5 overflow-y-auto flex-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsDrawerOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all min-h-[48px] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary ${
                    active
                      ? "bg-primary/10 text-primary font-semibold border border-primary/20 shadow-xs"
                      : "text-foreground hover:bg-muted/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg border ${
                        active
                          ? "bg-primary/20 border-primary/30 text-primary"
                          : "bg-muted border-border text-muted-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {item.label}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {active && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary text-primary-foreground font-mono">
                        Active
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Drawer Footer with Full-Width Logout Action */}
          <div className="p-4 pt-2 border-t border-border bg-card">
            <LogoutButton
              variant="outline"
              className="w-full justify-center min-h-[44px] border-destructive/30 bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs font-semibold rounded-xl"
            />
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
