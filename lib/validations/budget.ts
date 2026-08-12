import { z } from "zod";

/**
 * Authoritative Zod schema for creating or updating a Budget.
 */
export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.coerce
    .number({ message: "Amount must be a valid number" })
    .positive("Spending limit must be greater than 0")
    .transform((val) => Math.round(val * 100) / 100),
  month: z.coerce
    .number()
    .int("Month must be an integer")
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  year: z.coerce
    .number()
    .int("Year must be an integer")
    .min(2000, "Year must be 2000 or later")
    .max(2100, "Year must be 2100 or earlier"),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
