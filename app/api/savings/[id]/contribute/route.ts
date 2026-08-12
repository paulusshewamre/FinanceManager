import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { contributionSchema } from "@/lib/validations/savings";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { id } = await params;
    const body = await req.json();

    const result = contributionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { amount: contributionAmount } = result.data;

    // Verify existing goal and multi-tenant ownership lock
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGoal) {
      return NextResponse.json(
        { error: "Savings goal not found" },
        { status: 404 }
      );
    }

    const currentAccumulated = Number(existingGoal.accumulatedBalance);
    const targetAmount = Number(existingGoal.targetAmount);

    const newAccumulated = currentAccumulated + contributionAmount;
    const newStatus = newAccumulated >= targetAmount ? "COMPLETED" : "IN_PROGRESS";

    // Atomically update accumulated balance and auto-completion status (BR-016)
    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        accumulatedBalance: newAccumulated,
        status: newStatus,
      },
    });

    const numericTarget = Number(updatedGoal.targetAmount);
    const numericAccumulated = Number(updatedGoal.accumulatedBalance);
    const percentage = numericTarget > 0
      ? Math.min(100, Math.round((numericAccumulated / numericTarget) * 100))
      : 0;

    return NextResponse.json(
      {
        ...updatedGoal,
        targetAmount: numericTarget,
        accumulatedBalance: numericAccumulated,
        contributionAmount,
        percentage,
        remaining: Math.max(0, numericTarget - numericAccumulated),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("POST /api/savings/[id]/contribute error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
