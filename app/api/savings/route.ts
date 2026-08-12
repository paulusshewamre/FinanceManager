import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { savingsGoalSchema } from "@/lib/validations/savings";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    const goals = await prisma.savingsGoal.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let totalTarget = 0;
    let totalAccumulated = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    const enrichedGoals = goals.map((goal: any) => {
      const targetAmount = Number(goal.targetAmount);
      const accumulatedBalance = Number(goal.accumulatedBalance);
      const percentage = targetAmount > 0
        ? Math.min(100, Math.round((accumulatedBalance / targetAmount) * 100))
        : 0;
      const remaining = Math.max(0, targetAmount - accumulatedBalance);

      totalTarget += targetAmount;
      totalAccumulated += accumulatedBalance;

      if (goal.status === "COMPLETED") {
        completedCount++;
      } else {
        inProgressCount++;
      }

      return {
        id: goal.id,
        userId: goal.userId,
        name: goal.name,
        targetAmount,
        accumulatedBalance,
        targetDate: goal.targetDate,
        status: goal.status,
        percentage,
        remaining,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    });

    const overallPercentage = totalTarget > 0
      ? Math.min(100, Math.round((totalAccumulated / totalTarget) * 100))
      : 0;

    return NextResponse.json(
      {
        summary: {
          totalTarget,
          totalAccumulated,
          overallPercentage,
          completedCount,
          inProgressCount,
          totalCount: goals.length,
        },
        goals: enrichedGoals,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/savings error:", error);
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

    const result = savingsGoalSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, targetAmount, targetDate, accumulatedBalance = 0 } = result.data;

    // Evaluate completion status
    const status = accumulatedBalance >= targetAmount ? "COMPLETED" : "IN_PROGRESS";

    const goal = await prisma.savingsGoal.create({
      data: {
        userId,
        name,
        targetAmount,
        accumulatedBalance,
        targetDate,
        status,
      },
    });

    const numericTarget = Number(goal.targetAmount);
    const numericAccumulated = Number(goal.accumulatedBalance);
    const percentage = numericTarget > 0
      ? Math.min(100, Math.round((numericAccumulated / numericTarget) * 100))
      : 0;

    return NextResponse.json(
      {
        ...goal,
        targetAmount: numericTarget,
        accumulatedBalance: numericAccumulated,
        percentage,
        remaining: Math.max(0, numericTarget - numericAccumulated),
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("POST /api/savings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
