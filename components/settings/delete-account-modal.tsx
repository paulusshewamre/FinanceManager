"use client";

import { useState } from "react";
import { AlertOctagon, Loader2, X, ShieldAlert } from "lucide-react";
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

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const [confirmationInput, setConfirmationInput] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const CONFIRMATION_TEXT = "DELETE MY ACCOUNT";
  const isConfirmed = confirmationInput.trim() === CONFIRMATION_TEXT;

  const handleDeleteAccount = async () => {
    if (!isConfirmed) return;

    setServerError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/user/account", {
        method: "DELETE",
      });

      const body = await res.json();

      if (!res.ok) {
        setServerError(body.error || "Failed to purge account data");
        setIsSubmitting(false);
        return;
      }

      // Hard redirect to register page upon successful purging
      window.location.href = "/register";
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred during account deletion");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <Card className="w-full max-w-md bg-[#1b2024] border-rose-500/30 text-[#dee3e8] shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          type="button"
          disabled={isSubmitting}
          className="absolute top-4 right-4 p-1.5 text-[#94a3b8] hover:text-[#dee3e8] hover:bg-[#22272b] rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <CardHeader className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl font-bold text-rose-400">
              Permanent Account Purge
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[#94a3b8]">
            This action is irreversible. All of your personal financial records will be destroyed immediately (BR-019).
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {serverError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-2 text-xs">
            <h4 className="font-semibold text-rose-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              7-Table Cascading Data Hard Purge
            </h4>
            <p className="text-[#94a3b8] leading-relaxed">
              Deleting your account will permanently wipe out your User profile, Transactions, Monthly Budgets, Savings Goals, Custom Categories, active Auth Sessions, and Linked Accounts.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#dee3e8] block">
              To confirm, type <span className="font-mono text-rose-400 select-all font-bold">&quot;{CONFIRMATION_TEXT}&quot;</span> below:
            </label>
            <Input
              type="text"
              value={confirmationInput}
              onChange={(e) => setConfirmationInput(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              disabled={isSubmitting}
              className="bg-[#0f1418] border-[#303539] text-rose-300 placeholder:text-[#525960] font-mono text-xs focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-[#303539] bg-[#0f1418] text-[#dee3e8] hover:bg-[#22272b]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDeleteAccount}
            disabled={!isConfirmed || isSubmitting}
            className="bg-rose-600 text-white hover:bg-rose-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Purging Account Data...
              </>
            ) : (
              "Permanently Delete Account"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
