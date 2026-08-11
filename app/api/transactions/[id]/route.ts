import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { transactionSchema } from "@/lib/validations/transaction";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { id } = await params;
    const body = await req.json();

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (existingTransaction.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this transaction" },
        { status: 403 }
      );
    }

    const result = transactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { categoryId, amount, type, transactionDate, merchantName, notes } = result.data;

    // Verify target category exists and matches ownership (BR-008)
    const category = await prisma.category.findFirst({
      where: {
        id: categoryId,
        OR: [{ userId }, { isSystemDefault: true }],
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category or category not found" },
        { status: 404 }
      );
    }

    // Enforce Category Type Match (BR-003)
    if (category.type !== type) {
      return NextResponse.json(
        { error: `Category type (${category.type}) does not match transaction type (${type})` },
        { status: 400 }
      );
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: {
        categoryId,
        amount,
        type,
        transactionDate,
        merchantName: merchantName || null,
        notes: notes || null,
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

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("PUT /api/transactions/[id] error:", error);
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

    const existingTransaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTransaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (existingTransaction.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this transaction" },
        { status: 403 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: "Transaction deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("DELETE /api/transactions/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
