import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { budgetSchema } from "@/lib/validations/budget";
import { calculateBudgetUsage, BudgetCalculationResult } from "@/lib/calculations/budget";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const url = new URL(req.url);

    const now = new Date();
    const month = Math.min(12, Math.max(1, parseInt(url.searchParams.get("month") || String(now.getUTCMonth() + 1), 10)));
    const year = parseInt(url.searchParams.get("year") || String(now.getUTCFullYear()), 10);

    // Date bounds for calendar month UTC
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    // Fetch user budgets for specified month and year
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            isSystemDefault: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Aggregate expense transactions for each budget category in this month
    const categoryIds = budgets.map((b: any) => b.categoryId);

    const expenseAggregations = categoryIds.length > 0
      ? await prisma.transaction.groupBy({
          by: ["categoryId"],
          where: {
            userId,
            type: "EXPENSE",
            categoryId: { in: categoryIds },
            transactionDate: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            amount: true,
          },
        })
      : [];

    const spentMap = new Map<string, number>();
    for (const agg of expenseAggregations) {
      if (agg.categoryId && agg._sum.amount) {
        spentMap.set(agg.categoryId, Number(agg._sum.amount));
      }
    }

    let totalBudgeted = 0;
    let totalSpent = 0;

    const enrichedBudgets = budgets.map((b: any) => {
      const limit = Number(b.amount);
      const spent = spentMap.get(b.categoryId) || 0;
      const usage: BudgetCalculationResult = calculateBudgetUsage(spent, limit);

      totalBudgeted += limit;
      totalSpent += spent;

      return {
        id: b.id,
        userId: b.userId,
        categoryId: b.categoryId,
        amount: limit,
        month: b.month,
        year: b.year,
        category: b.category,
        spent: usage.spent,
        remaining: usage.remaining,
        overrun: usage.overrun,
        percentage: usage.percentage,
        status: usage.status,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      };
    });

    const summaryUsage = calculateBudgetUsage(totalSpent, totalBudgeted);

    return NextResponse.json(
      {
        month,
        year,
        summary: {
          totalBudgeted: summaryUsage.limit,
          totalSpent: summaryUsage.spent,
          remaining: summaryUsage.remaining,
          overrun: summaryUsage.overrun,
          percentage: summaryUsage.percentage,
          status: summaryUsage.status,
        },
        budgets: enrichedBudgets,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/budgets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const body = await req.json();

    const result = budgetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { categoryId, amount, month, year } = result.data;

    // Verify category exists and is owned by user or system default
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId }, { isSystemDefault: true }],
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Verify category is EXPENSE type (BR-007)
    if (category.type !== "EXPENSE") {
      return NextResponse.json(
        { error: "Budgets can only be set for EXPENSE categories" },
        { status: 400 }
      );
    }

    // Upsert budget record enforcing unique constraint @@unique([userId, categoryId, month, year])
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month,
          year,
        },
      },
      create: {
        userId,
        categoryId,
        amount,
        month,
        year,
      },
      update: {
        amount,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            isSystemDefault: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        ...budget,
        amount: Number(budget.amount),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("POST /api/budgets error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
