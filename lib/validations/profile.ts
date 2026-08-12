import { z } from "zod";

export const ALLOWED_CURRENCY_SYMBOLS = ["$", "€", "£", "¥"] as const;

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(50, "Display name is too long")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  preferredCurrencySymbol: z
    .enum(["$", "€", "£", "¥"])
    .optional(),
  themePreference: z.enum(["dark", "light", "system"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
