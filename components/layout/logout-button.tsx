"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  className?: string;
  showText?: boolean;
}

export function LogoutButton({
  variant = "ghost",
  className = "",
  showText = true,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
            router.refresh();
          },
        },
      });
    } catch (err) {
      console.error("Failed to log out:", err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex items-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 ${className}`}
      title="Sign out of your account"
    >
      {isLoggingOut ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      ) : (
        <LogOut className="w-4 h-4 shrink-0" />
      )}
      {showText && <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>}
    </Button>
  );
}
