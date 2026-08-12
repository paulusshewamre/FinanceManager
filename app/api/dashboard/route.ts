import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1; // 1-indexed

    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

    let attempts = 0;
    const maxAttempts = 3;
    let dashboardData: any = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;

        // Consolidate queries into 6 parallel requests for fast execution & zero pool exhaustion
        const [
          allTimeGrouped,
          monthlyGrouped,
          recentTransactions,
          activeBudgets,
          categorySpendingAgg,
          savingsGoals,
        ] = await Promise.all([
          // 1. All-time Sums grouped by INCOME / EXPENSE
          prisma.transaction.groupBy({
            by: ["type"],
            where: { userId },
            _sum: { amount: true },
          }),

          // 2. Current Month Sums grouped by INCOME / EXPENSE
          prisma.transaction.groupBy({
            by: ["type"],
            where: {
              userId,
              transactionDate: { gte: startOfMonth, lte: endOfMonth },
            },
            _sum: { amount: true },
          }),

          // 3. Recent 5 Transactions
          prisma.transaction.findMany({
            where: { userId },
            orderBy: { transactionDate: "desc" },
            take: 5,
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          }),

          // 4. Active Budgets for Current Month
          prisma.budget.findMany({
            where: { userId, year: currentYear, month: currentMonth },
            include: {
              category: {
                select: { name: true },
              },
            },
          }),

          // 5. Grouped Expense Spending per Category for Current Month
          prisma.transaction.groupBy({
            by: ["categoryId"],
            where: {
              userId,
              type: "EXPENSE",
              transactionDate: { gte: startOfMonth, lte: endOfMonth },
            },
            _sum: { amount: true },
          }),

          // 6. Savings Goals
          prisma.savingsGoal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
          }),
        ]);

        // Process All-Time Totals
        let totalIncomeAllTime = 0;
        let totalExpenseAllTime = 0;
        for (const item of allTimeGrouped) {
          if (item.type === "INCOME") totalIncomeAllTime = Number(item._sum.amount || 0);
          if (item.type === "EXPENSE") totalExpenseAllTime = Number(item._sum.amount || 0);
        }
        const netBalance = totalIncomeAllTime - totalExpenseAllTime;

        // Process Monthly Cashflow Totals
        let monthlyIncome = 0;
        let monthlyExpense = 0;
        for (const item of monthlyGrouped) {
          if (item.type === "INCOME") monthlyIncome = Number(item._sum.amount || 0);
          if (item.type === "EXPENSE") monthlyExpense = Number(item._sum.amount || 0);
        }
        const monthlyNet = monthlyIncome - monthlyExpense;
        const savingsRate =
          monthlyIncome > 0
            ? Math.max(0, Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100))
            : 0;

        // Format Recent Transactions
        const formattedRecentTransactions = recentTransactions.map((tx: any) => ({
          id: tx.id,
          amount: Number(tx.amount),
          type: tx.type,
          merchantName: tx.merchantName,
          notes: tx.notes,
          transactionDate: tx.transactionDate.toISOString(),
          category: tx.category
            ? {
                id: tx.category.id,
                name: tx.category.name,
                type: tx.category.type,
              }
            : null,
        }));

        // Map Category Spending Lookup Table
        const spendingMap = new Map<string, number>();
        for (const item of categorySpendingAgg) {
          spendingMap.set(item.categoryId, Number(item._sum.amount || 0));
        }

        // Evaluate Budget Alerts
        const budgetAlerts = activeBudgets.map((budget: any) => {
          const spent = spendingMap.get(budget.categoryId) || 0;
          const limit = Number(budget.amount);
          const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;

          let status: "NORMAL" | "WARNING" | "EXCEEDED" = "NORMAL";
          if (percentage >= 100) {
            status = "EXCEEDED";
          } else if (percentage >= 80) {
            status = "WARNING";
          }

          return {
            id: budget.id,
            categoryId: budget.categoryId,
            categoryName: budget.category?.name || "Category",
            spent,
            limit,
            percentage,
            status,
          };
        });

        const warningBudgetAlerts = budgetAlerts.filter((b) => b.status !== "NORMAL");

        // Savings Goals Metrics
        const totalSavingsTarget = savingsGoals.reduce((acc: number, g: any) => acc + Number(g.targetAmount), 0);
        const totalSavingsAccumulated = savingsGoals.reduce((acc: number, g: any) => acc + Number(g.accumulatedBalance), 0);
        const topActiveSavingsGoals = savingsGoals
          .filter((g: any) => g.status === "IN_PROGRESS")
          .slice(0, 2)
          .map((g: any) => ({
            id: g.id,
            name: g.name,
            targetAmount: Number(g.targetAmount),
            accumulatedBalance: Number(g.accumulatedBalance),
            percentage:
              Number(g.targetAmount) > 0
                ? Math.min(100, Math.round((Number(g.accumulatedBalance) / Number(g.targetAmount)) * 100))
                : 0,
            targetDate: g.targetDate.toISOString(),
          }));

        dashboardData = {
          summary: {
            netBalance,
            totalIncomeAllTime,
            totalExpenseAllTime,
            monthlyIncome,
            monthlyExpense,
            monthlyNet,
            savingsRate,
          },
          recentTransactions: formattedRecentTransactions,
          budgetAlerts: warningBudgetAlerts,
          allBudgetStatuses: budgetAlerts,
          savingsSummary: {
            totalSavingsTarget,
            totalSavingsAccumulated,
            activeGoalsCount: savingsGoals.filter((g: any) => g.status === "IN_PROGRESS").length,
            completedGoalsCount: savingsGoals.filter((g: any) => g.status === "COMPLETED").length,
            topActiveGoals: topActiveSavingsGoals,
          },
        };

        break;
      } catch (err: any) {
        const isTimeout =
          err?.code === "ETIMEDOUT" ||
          err?.code === "P1001" ||
          err?.code === "P2024" ||
          err?.message?.includes("ETIMEDOUT") ||
          err?.message?.includes("connection") ||
          err?.message?.includes("findMany") ||
          err?.message?.includes("groupBy") ||
          err?.name?.includes("PrismaClient");

        if (isTimeout && attempts < maxAttempts) {
          const delay = attempts * 500;
          console.warn(`[GET /api/dashboard] DB attempt ${attempts} encountered transient DB delay (${err?.message || err?.code}). Retrying in ${delay}ms...`);
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw err;
      }
    }

    return NextResponse.json(dashboardData);
  } catch (error: any) {
    if (error?.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
