import { z } from "zod";

/**
 * Authoritative Zod schema for creating or updating a Transaction.
 */
export const transactionSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce
    .number({ message: "Amount must be a valid number" })
    .positive("Amount must be greater than 0")
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places
  type: z.enum(["INCOME", "EXPENSE"] as const, {
    message: "Type must be either INCOME or EXPENSE",
  }),
  transactionDate: z.coerce.date({
    message: "Transaction date must be a valid date",
  }),
  merchantName: z
    .string()
    .trim()
    .max(100, "Merchant name cannot exceed 100 characters")
    .optional()
    .nullable(),
  notes: z
    .string()
    .trim()
    .max(500, "Notes cannot exceed 500 characters")
    .optional()
    .nullable(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
