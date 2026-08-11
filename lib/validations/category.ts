import { z } from "zod";

/**
 * CategoryType enum constants for bundling safety in Next.js Server & Client components.
 */
export const CategoryTypeEnum = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type CategoryType = (typeof CategoryTypeEnum)[keyof typeof CategoryTypeEnum];

/**
 * Authoritative Zod schema for creating or updating a Category.
 */
export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name is required")
    .max(50, "Category name cannot exceed 50 characters"),
  type: z.enum(["INCOME", "EXPENSE"] as const, {
    message: "Type must be either INCOME or EXPENSE",
  }),
});

export type CategoryInput = z.infer<typeof categorySchema>;
