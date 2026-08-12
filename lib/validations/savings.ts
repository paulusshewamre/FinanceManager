import { z } from "zod";

/**
 * Zod validation schema for creating a new Savings Goal.
 * Enforces BR-014 (targetAmount > 0) and BR-015 (targetDate in future).
 */
export const savingsGoalSchema = z.object({
  name: z
    .string()
    .min(1, "Goal name is required")
    .max(50, "Goal name must not exceed 50 characters")
    .transform((val) => val.trim()),
  targetAmount: z
    .number({ message: "Target amount must be a number" })
    .positive("Target amount must be greater than zero"),
  targetDate: z.coerce
    .date({ message: "Target date must be a valid date" })
    .refine((date) => {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      return date >= today;
    }, "Target date must be today or in the future"),
  accumulatedBalance: z
    .number()
    .min(0, "Accumulated balance cannot be negative")
    .optional()
    .default(0),
});

/**
 * Zod validation schema for updating an existing Savings Goal.
 */
export const savingsGoalUpdateSchema = savingsGoalSchema.partial();

/**
 * Zod validation schema for contributing funds to a Savings Goal.
 */
export const contributionSchema = z.object({
  amount: z
    .number({ message: "Contribution amount must be a number" })
    .positive("Contribution amount must be greater than zero"),
});

export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
export type SavingsGoalUpdateInput = z.infer<typeof savingsGoalUpdateSchema>;
export type ContributionInput = z.infer<typeof contributionSchema>;
