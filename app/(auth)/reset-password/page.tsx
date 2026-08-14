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
      <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              <Lock className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
            Set New Password
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-2xl">
      <CardHeader className="space-y-2 text-center">
        <div className="flex justify-center mb-2">
          <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary">
            <Lock className="w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
          Set New Password
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Enter your new password below to update your account credentials
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
        <CardContent className="space-y-4">
          {!token && (
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30 text-warning text-sm flex items-start gap-2.5" suppressHydrationWarning>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Missing reset token. Please use the reset link provided in your email.</span>
            </div>
          )}

          {serverError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start gap-2.5" suppressHydrationWarning>
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-2.5" suppressHydrationWarning>
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="space-y-1.5" suppressHydrationWarning>
            <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting || !token || !!successMessage}
              {...register("password")}
              className="bg-background border-border text-foreground focus-visible:ring-primary"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5" suppressHydrationWarning>
            <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              disabled={isSubmitting || !token || !!successMessage}
              {...register("confirmPassword")}
              className="bg-background border-border text-foreground focus-visible:ring-primary"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || !token || !!successMessage}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg transition-all"
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

          <div className="text-center text-xs text-muted-foreground">
            <Link
              href="/login"
              className="inline-flex items-center text-primary hover:underline font-semibold"
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
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4" suppressHydrationWarning>
      <Suspense
        fallback={
          <div className="flex items-center justify-center text-muted-foreground">
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
