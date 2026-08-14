"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ShieldAlert } from "lucide-react";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
}: DeleteAccountModalProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteAccount = async () => {
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
    <ConfirmDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setServerError(null);
          onClose();
        }
      }}
      title="Permanent Account Purge"
      description="This action is irreversible. All of your personal financial records will be destroyed immediately (BR-019)."
      variant="destructive"
      confirmText="Permanently Delete Account"
      cancelText="Cancel"
      loading={isSubmitting}
      error={serverError}
      onConfirm={handleDeleteAccount}
      confirmInputText={{
        expectedValue: "DELETE MY ACCOUNT",
      }}
      details={
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 space-y-1.5 text-xs text-foreground">
          <h4 className="font-semibold text-destructive flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            7-Table Cascading Data Hard Purge
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            Deleting your account will permanently wipe out your User profile, Transactions, Monthly Budgets, Savings Goals, Custom Categories, active Auth Sessions, and Linked Accounts.
          </p>
        </div>
      }
    />
  );
}
