"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { requestPasswordReset } from "@/lib/auth/auth-client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth";
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

export default function ForgotPasswordPage() {
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
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setServerError(null);
    setSuccessMessage(null);
    try {
      const res = await requestPasswordReset({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (res?.error) {
        setServerError(res.error.message || "Failed to process password reset request.");
        return;
      }

      setSuccessMessage(
        "Password reset email sent. Check your inbox for further instructions."
      );
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
      <div
        className="min-h-screen flex items-center justify-center bg-background text-foreground p-4"
        suppressHydrationWarning
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4" suppressHydrationWarning>
      <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 text-primary">
              <KeyRound className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
            Reset Password
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your account email to receive a password reset link
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
          <CardContent className="space-y-4">
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
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                disabled={isSubmitting || !!successMessage}
                {...register("email")}
                className="bg-background border-border text-foreground focus-visible:ring-primary"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || !!successMessage}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground" suppressHydrationWarning>
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
    </div>
  );
}
