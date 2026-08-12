import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { budgetSchema } from "@/lib/validations/budget";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { id: budgetId } = await params;

    // Verify budget exists and belongs to user (Multi-tenant lock)
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const result = budgetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { categoryId, amount, month, year } = result.data;

    // Verify category exists and is EXPENSE type
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

    if (category.type !== "EXPENSE") {
      return NextResponse.json(
        { error: "Budgets can only be set for EXPENSE categories" },
        { status: 400 }
      );
    }

    const updatedBudget = await prisma.budget.update({
      where: {
        id: budgetId,
      },
      data: {
        categoryId,
        amount,
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
    });

    return NextResponse.json(
      {
        ...updatedBudget,
        amount: Number(updatedBudget.amount),
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("PUT /api/budgets/[id] error:", error);
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
    const { id: budgetId } = await params;

    // Verify budget exists and belongs to user (Multi-tenant lock)
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId,
      },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Budget not found" },
        { status: 404 }
      );
    }

    await prisma.budget.delete({
      where: {
        id: budgetId,
      },
    });

    return NextResponse.json(
      { message: "Budget deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/budgets/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
