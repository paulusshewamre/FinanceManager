import { z } from "zod";

export const ALLOWED_CURRENCY_SYMBOLS = ["Br", "$", "€", "£", "¥"] as const;

export interface SupportedCurrency {
  code: string;
  symbol: string;
  name: string;
  label: string;
  country: string;
}

export const SUPPORTED_CURRENCIES: SupportedCurrency[] = [
  {
    code: "ETB",
    symbol: "Br",
    name: "Ethiopian Birr",
    label: "Ethiopian Birr (Br)",
    country: "Ethiopia",
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    label: "US Dollar ($)",
    country: "United States",
  },
  {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    label: "Euro (€)",
    country: "European Union",
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    label: "British Pound (£)",
    country: "United Kingdom",
  },
  {
    code: "JPY",
    symbol: "¥",
    name: "Japanese Yen",
    label: "Japanese Yen (¥)",
    country: "Japan",
  },
];

export const DEFAULT_CURRENCY_SYMBOL = "Br";
export const DEFAULT_CURRENCY_CODE = "ETB";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .max(50, "Display name is too long")
    .optional()
    .transform((val) => (val && val.length > 0 ? val : undefined)),
  preferredCurrencySymbol: z
    .enum(ALLOWED_CURRENCY_SYMBOLS)
    .optional(),
  themePreference: z.enum(["dark", "light", "system"]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
