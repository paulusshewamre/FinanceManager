export type BudgetStatus = "NORMAL" | "WARNING" | "EXCEEDED";

export interface BudgetCalculationResult {
  spent: number;
  limit: number;
  percentage: number;
  remaining: number;
  overrun: number;
  status: BudgetStatus;
}

/**
 * Calculates category budget progress percentage and warning threshold state.
 *
 * Rules (BR-008, BR-009, FR-044):
 * - NORMAL: P_b < 80%
 * - WARNING (Amber Badge): 80% <= P_b < 100%
 * - EXCEEDED (Red Alert Badge): P_b >= 100%
 */
export function calculateBudgetUsage(spent: number, limit: number): BudgetCalculationResult {
  const round2 = (val: number) => Math.round(val * 100) / 100;

  const numSpent = round2(Math.max(0, spent));
  const numLimit = round2(Math.max(0, limit));

  const rawPercentage = numLimit > 0 ? (numSpent / numLimit) * 100 : 0;
  const percentage = round2(rawPercentage);

  let status: BudgetStatus = "NORMAL";
  if (percentage >= 100) {
    status = "EXCEEDED";
  } else if (percentage >= 80) {
    status = "WARNING";
  }

  const remaining = round2(Math.max(0, numLimit - numSpent));
  const overrun = round2(Math.max(0, numSpent - numLimit));

  return {
    spent: numSpent,
    limit: numLimit,
    percentage,
    remaining,
    overrun,
    status,
  };
}
