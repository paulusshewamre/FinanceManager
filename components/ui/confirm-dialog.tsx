"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Trash2, Loader2, AlertOctagon } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  details?: React.ReactNode;
  warningText?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "default" | "warning";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
  /** Optional verification input requirement (e.g., typing "DELETE MY ACCOUNT") */
  confirmInputText?: {
    expectedValue: string;
    label?: string;
    placeholder?: string;
  };
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  details,
  warningText,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive",
  onConfirm,
  loading = false,
  error = null,
  confirmInputText,
}: ConfirmDialogProps) {
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      setInputValue("");
    }
  }, [open]);

  const isInputConfirmed = confirmInputText
    ? inputValue.trim() === confirmInputText.expectedValue.trim()
    : true;

  const getIcon = () => {
    switch (variant) {
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "destructive":
      default:
        return confirmInputText ? (
          <AlertOctagon className="w-5 h-5" />
        ) : (
          <Trash2 className="w-5 h-5" />
        );
    }
  };

  const getIconContainerStyles = () => {
    switch (variant) {
      case "warning":
        return "bg-warning/10 border-warning/20 text-warning";
      case "destructive":
      default:
        return "bg-destructive/10 border-destructive/20 text-destructive";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-card border-border text-card-foreground shadow-2xl p-6"
        aria-describedby="confirm-dialog-description"
      >
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border shrink-0 ${getIconContainerStyles()}`}
            >
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              <div
                id="confirm-dialog-description"
                className="text-xs text-muted-foreground mt-0.5"
              >
                {description}
              </div>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2 animate-in fade-in"
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {warningText && (
          <div className="p-3 rounded-xl bg-warning/10 border border-warning/30 text-warning text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{warningText}</span>
          </div>
        )}

        {details && (
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs text-muted-foreground space-y-1">
            {details}
          </div>
        )}

        {confirmInputText && (
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-foreground block">
              {confirmInputText.label || (
                <>
                  To confirm, type{" "}
                  <span className="font-mono text-destructive select-all font-bold">
                    &quot;{confirmInputText.expectedValue}&quot;
                  </span>{" "}
                  below:
                </>
              )}
            </label>
            <Input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={confirmInputText.placeholder || confirmInputText.expectedValue}
              disabled={loading}
              className="bg-background border-border text-destructive placeholder:text-muted-foreground font-mono text-xs focus-visible:ring-destructive"
              aria-label={`Type ${confirmInputText.expectedValue} to confirm`}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-border bg-background hover:bg-muted text-foreground font-medium min-h-[40px]"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={!isInputConfirmed || loading}
            className={`font-semibold min-h-[40px] ${
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                : variant === "warning"
                ? "bg-warning text-warning-foreground hover:bg-warning/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
