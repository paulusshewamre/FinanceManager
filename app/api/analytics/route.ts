import { NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/auth/session";
import prisma from "@/lib/db/prisma";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    const { searchParams } = new URL(req.url);
    const monthsCount = Math.min(12, Math.max(3, parseInt(searchParams.get("months") || "6", 10)));

    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth() + 1; // 1-indexed

    // 1. Current Month Category Breakdown
    const startOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0, 0));
    const endOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

    const currentMonthExpenses = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        transactionDate: {
          gte: startOfCurrentMonth,
          lte: endOfCurrentMonth,
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const totalExpenseCurrentMonth = currentMonthExpenses.reduce(
      (acc: number, tx: any) => acc + Number(tx.amount),
      0
    );

    const categoryMap = new Map<string, { id: string; name: string; total: number }>();

    for (const tx of currentMonthExpenses) {
      const catId = tx.categoryId;
      const catName = tx.category?.name || "Uncategorized";
      const amt = Number(tx.amount);

      if (categoryMap.has(catId)) {
        categoryMap.get(catId)!.total += amt;
      } else {
        categoryMap.set(catId, { id: catId, name: catName, total: amt });
      }
    }

    const defaultColors = [
      "#38bdf8", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6",
      "#f97316", "#06b6d4", "#a855f7", "#64748b"
    ];

    const categoryBreakdown = Array.from(categoryMap.values())
      .map((item, index) => ({
        categoryId: item.id,
        categoryName: item.name,
        color: defaultColors[index % defaultColors.length],
        amount: item.total,
        percentage: totalExpenseCurrentMonth > 0 ? Math.round((item.total / totalExpenseCurrentMonth) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    // 2. Historical Monthly Trends (Income vs Expense vs Net)
    const monthlyTrends = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(currentYear, currentMonth - 1 - i, 1));
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth() + 1;

      const mStart = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
      const mEnd = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

      const incAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          type: "INCOME",
          transactionDate: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      });

      const expAgg = await prisma.transaction.aggregate({
        where: {
          userId,
          type: "EXPENSE",
          transactionDate: { gte: mStart, lte: mEnd },
        },
        _sum: { amount: true },
      });

      const income = Number(incAgg._sum.amount || 0);
      const expense = Number(expAgg._sum.amount || 0);
      const net = income - expense;

      monthlyTrends.push({
        monthKey: `${year}-${String(month).padStart(2, "0")}`,
        monthLabel: `${monthNames[month - 1]} ${year}`,
        shortLabel: monthNames[month - 1],
        income,
        expense,
        net,
      });
    }

    return NextResponse.json({
      monthsCount,
      totalExpenseCurrentMonth,
      categoryBreakdown,
      monthlyTrends,
    });
  } catch (error: any) {
    if (error?.name === "UnauthorizedError") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /api/analytics error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
