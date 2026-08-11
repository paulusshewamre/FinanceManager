"use client";

import { useSession } from "@/lib/auth/auth-client";
import { Navbar } from "@/components/layout/navbar";
import { LogoutButton } from "@/components/layout/logout-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, User, ShieldCheck, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  return (
    <div className="min-h-screen bg-[#0f1418] text-[#dee3e8]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-[#1b2024] rounded-2xl border border-[#303539] shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                Milestone 1 Verified
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#dee3e8] tracking-tight">
              Welcome Back, {session?.user?.name || "User"}!
            </h1>
            <p className="text-sm text-[#94a3b8]">
              Your Personal Finance Manager account is active and protected by session middleware.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <LogoutButton variant="default" className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 px-4 py-2" />
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Account Info Card */}
          <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#dee3e8]">
                <User className="w-5 h-5 text-[#38bdf8]" />
                User Account Overview
              </CardTitle>
              <CardDescription className="text-xs text-[#94a3b8]">
                Current session details retrieved securely via Better Auth client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-[#0f1418] rounded-xl border border-[#303539] space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#94a3b8] flex items-center gap-2">
                    <User className="w-4 h-4 text-[#38bdf8]" /> Name
                  </span>
                  <span className="font-semibold text-[#dee3e8]">
                    {isPending ? "Loading..." : session?.user?.name || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-[#303539]">
                  <span className="text-[#94a3b8] flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#38bdf8]" /> Email
                  </span>
                  <span className="font-mono text-xs text-[#dee3e8]">
                    {isPending ? "Loading..." : session?.user?.email || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-2 border-t border-[#303539]">
                  <span className="text-[#94a3b8] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Status
                  </span>
                  <span className="text-xs font-semibold text-emerald-400">
                    Authenticated
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <LogoutButton className="w-full justify-center bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20" />
              </div>
            </CardContent>
          </Card>

          {/* Milestone 1 Status & Next Steps */}
          <Card className="bg-[#1b2024] border-[#303539] text-[#dee3e8]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-[#dee3e8]">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Milestone 1 Completion Checklist
              </CardTitle>
              <CardDescription className="text-xs text-[#94a3b8]">
                Authentication & User Account Security Functionalities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between p-2.5 bg-[#0f1418] rounded-lg border border-[#303539]">
                  <span>1. User Registration & Database Schema</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#0f1418] rounded-lg border border-[#303539]">
                  <span>2. User Login & Credential Verification</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#0f1418] rounded-lg border border-[#303539]">
                  <span>3. Session Middleware & Multi-Tenant Protection</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#0f1418] rounded-lg border border-[#303539]">
                  <span>4. Secure Logout & Invalidation</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                </li>
                <li className="flex items-center justify-between p-2.5 bg-[#0f1418] rounded-lg border border-[#303539]">
                  <span>5. Password Recovery & Resend Email Setup</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  href="/categories"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold text-xs transition-all"
                >
                  Proceed to Milestone 2 (Category Management)
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
