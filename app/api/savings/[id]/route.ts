import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { savingsGoalUpdateSchema } from "@/lib/validations/savings";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { id } = await params;
    const body = await req.json();

    const result = savingsGoalUpdateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

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

    const newTarget = result.data.targetAmount !== undefined
      ? result.data.targetAmount
      : Number(existingGoal.targetAmount);

    const newAccumulated = result.data.accumulatedBalance !== undefined
      ? result.data.accumulatedBalance
      : Number(existingGoal.accumulatedBalance);

    // Auto-update completion status based on new balance & target
    const newStatus = newAccumulated >= newTarget ? "COMPLETED" : "IN_PROGRESS";

    const updatedGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        ...(result.data.name && { name: result.data.name }),
        ...(result.data.targetAmount !== undefined && { targetAmount: result.data.targetAmount }),
        ...(result.data.accumulatedBalance !== undefined && { accumulatedBalance: result.data.accumulatedBalance }),
        ...(result.data.targetDate && { targetDate: result.data.targetDate }),
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
        percentage,
        remaining: Math.max(0, numericTarget - numericAccumulated),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("PUT /api/savings/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { id } = await params;

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

    await prisma.savingsGoal.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: "Savings goal deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/savings/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
