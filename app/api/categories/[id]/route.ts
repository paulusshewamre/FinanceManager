import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validations/category";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const { id } = await params;
    const body = await req.json();

    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existingCategory.isSystemDefault) {
      return NextResponse.json(
        { error: "System default categories cannot be modified" },
        { status: 403 }
      );
    }

    if (existingCategory.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this category" },
        { status: 403 }
      );
    }

    const { name, type } = result.data;

    // Check duplicate name for user/type excluding current category
    const duplicate = await prisma.category.findFirst({
      where: {
        id: { not: id },
        type,
        OR: [
          { userId, name: { equals: name, mode: "insensitive" } },
          { isSystemDefault: true, name: { equals: name, mode: "insensitive" } },
        ],
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { error: `Category "${name}" already exists for type ${type}` },
        { status: 409 }
      );
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name, type },
    });

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("PUT /api/categories/[id] error:", error);
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
    const url = new URL(req.url);
    const reassignTo = url.searchParams.get("reassignTo");

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    if (existingCategory.isSystemDefault) {
      return NextResponse.json(
        { error: "System default categories cannot be deleted" },
        { status: 403 }
      );
    }

    if (existingCategory.userId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: You do not own this category" },
        { status: 403 }
      );
    }

    // Execute reassignment and deletion atomically
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      if (reassignTo) {
        // Verify target reassignment category exists and matches type
        const targetCategory = await tx.category.findUnique({
          where: { id: reassignTo },
        });

        if (!targetCategory) {
          throw new Error("Target reassignment category not found");
        }

        if (targetCategory.type !== existingCategory.type) {
          throw new Error("Target category must match the type of category being deleted");
        }

        // Reassign any transactions linked to this category (if transaction model exists in future)
        if ("transaction" in tx) {
          await (tx as any).transaction.updateMany({
            where: { categoryId: id, userId },
            data: { categoryId: reassignTo },
          });
        }
      }

      await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json(
      { message: "Category deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error.message?.includes("Target")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("DELETE /api/categories/[id] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
