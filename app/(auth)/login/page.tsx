"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        setServerError(res.error.message || "Invalid email or password credentials.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError("Invalid email or password credentials.");
      }
    }
  };

  if (!mounted) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-[#0f1418] text-[#dee3e8] p-4"
        suppressHydrationWarning
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1418] text-[#dee3e8] p-4" suppressHydrationWarning>
      <Card className="w-full max-w-md bg-[#1b2024] border-[#303539] text-[#dee3e8] shadow-2xl">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-[#38bdf8]/10 rounded-xl border border-[#38bdf8]/20 text-[#38bdf8]">
              <LogIn className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#dee3e8] tracking-tight">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-sm text-[#94a3b8]">
            Sign in to access your personal finance dashboard
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} suppressHydrationWarning>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-2.5" suppressHydrationWarning>
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="space-y-1.5" suppressHydrationWarning>
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                disabled={isSubmitting}
                {...register("email")}
                className="bg-[#0f1418] border-[#303539] focus:border-[#38bdf8] text-[#dee3e8]"
              />
              {errors.email && (
                <p className="text-xs text-rose-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5" suppressHydrationWarning>
              <div className="flex items-center justify-between" suppressHydrationWarning>
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[#aeb9d0]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#38bdf8] hover:underline"
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
                className="bg-[#0f1418] border-[#303539] focus:border-[#38bdf8] text-[#dee3e8]"
              />
              {errors.password && (
                <p className="text-xs text-rose-400">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1" suppressHydrationWarning>
              <input
                id="rememberMe"
                type="checkbox"
                suppressHydrationWarning
                disabled={isSubmitting}
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-[#303539] bg-[#0f1418] text-[#38bdf8] focus:ring-[#38bdf8] accent-[#38bdf8]"
              />
              <label htmlFor="rememberMe" className="text-xs text-[#94a3b8] cursor-pointer">
                Remember me on this device
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#38bdf8] text-[#001e2c] hover:bg-[#38bdf8]/90 font-semibold py-2.5 rounded-lg transition-all"
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

            <div className="text-center text-xs text-[#94a3b8]" suppressHydrationWarning>
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-[#38bdf8] hover:underline font-semibold"
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
