import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validations/category";

export async function GET(req?: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);

    const categories = await prisma.category.findMany({
      where: {
        OR: [{ userId }, { isSystemDefault: true }],
      },
      orderBy: [{ isSystemDefault: "desc" }, { name: "asc" }],
    });

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/categories error:", error);
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

    const result = categorySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, type } = result.data;

    // Check for duplicate category name for this user & type (case-insensitive check)
    const existingCategory = await prisma.category.findFirst({
      where: {
        type,
        OR: [
          { userId, name: { equals: name, mode: "insensitive" } },
          { isSystemDefault: true, name: { equals: name, mode: "insensitive" } },
        ],
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: `Category "${name}" already exists for type ${type}` },
        { status: 409 }
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        type,
        userId,
        isSystemDefault: false,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("POST /api/categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
