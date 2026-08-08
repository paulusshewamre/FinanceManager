"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { resetPassword } from "@/lib/auth/auth-client";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);

    if (!token) {
      setServerError("Invalid or missing password reset token. Please request a new link.");
      return;
    }

    try {
      const res = await resetPassword({
        newPassword: data.password,
        token: token,
      });

      if (res?.error) {
        setServerError(res.error.message || "Failed to reset password. Token may have expired.");
        return;
      }

      setSuccessMessage("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("An unexpected error occurred. Please try again.");
      }
    }
  };

  if (!mounted) {
    return (
      <Card className="w-full max-w-md bg-[#1b2024] border-[#303539] text-[#dee3e8] shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-[#38bdf8]/10 rounded-xl border border-[#38bdf8]/20 text-[#38bdf8]">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#dee3e8] tracking-tight">
            Set New Password
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-[#1b2024] border-[#303539] text-[#dee3e8] shadow-2xl">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-[#38bdf8]/10 rounded-xl border border-[#38bdf8]/20 text-[#38bdf8]">
            <Lock className="w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-[#dee3e8] tracking-tight">
          Set New Password
        </CardTitle>
        <CardDescription className="text-sm text-[#94a3b8]">
          Enter your new password below to update your account credentials
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {!token && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Missing reset token. Please use the reset link provided in your email.</span>
            </div>
          )}

          {serverError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting || !token || !!successMessage}
              {...register("password")}
              className="bg-[#0f1418] border-[#303539] focus:border-[#38bdf8] text-[#dee3e8]"
            />
            {errors.password && (
              <p className="text-xs text-rose-400">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting || !token || !!successMessage}
              {...register("confirmPassword")}
              className="bg-[#0f1418] border-[#303539] focus:border-[#38bdf8] text-[#dee3e8]"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !token || !!successMessage}
            className="w-full bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold py-2.5 rounded-lg transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Updating Password...
              </>
            ) : (
              "Update Password"
            )}
          </Button>

          <div className="text-center text-xs text-[#94a3b8]">
            <Link
              href="/login"
              className="inline-flex items-center text-[#38bdf8] hover:underline font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to sign in
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1418] text-[#dee3e8] p-4" suppressHydrationWarning>
      <Suspense
        fallback={
          <div className="flex items-center justify-center text-[#94a3b8]">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading reset form...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
