"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn, AlertCircle } from "lucide-react";
import { signIn } from "@/lib/auth/auth-client";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
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

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate and sanitize target redirect path to prevent open redirect vulnerabilities
  const rawRedirectTo = searchParams.get("redirectTo");
  const targetRedirect =
    rawRedirectTo &&
    rawRedirectTo.startsWith("/") &&
    !rawRedirectTo.startsWith("//") &&
    !rawRedirectTo.startsWith("/\\")
      ? rawRedirectTo
      : "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setServerError(null);
    try {
      const res = await signIn.email({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      });

      if (res.error) {
        setServerError("Invalid email or password credentials.");
        return;
      }

      router.push(targetRedirect);
      router.refresh();
    } catch {
      setServerError("Invalid email or password credentials.");
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
              <LogIn className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Sign in to access your personal finance dashboard
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

            <div className="space-y-1.5" suppressHydrationWarning>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                disabled={isSubmitting}
                {...register("email")}
                className="bg-background border-border text-foreground focus-visible:ring-primary"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5" suppressHydrationWarning>
              <div className="flex items-center justify-between" suppressHydrationWarning>
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                {...register("password")}
                className="bg-background border-border text-foreground focus-visible:ring-primary"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1" suppressHydrationWarning>
              <input
                id="rememberMe"
                type="checkbox"
                suppressHydrationWarning
                disabled={isSubmitting}
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary accent-primary"
              />
              <label htmlFor="rememberMe" className="text-xs text-muted-foreground cursor-pointer">
                Remember me on this device
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold py-2.5 rounded-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="text-center text-xs text-muted-foreground" suppressHydrationWarning>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-semibold"
              >
                Create account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
