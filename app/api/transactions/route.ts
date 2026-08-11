import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { getAuthenticatedUserId, UnauthorizedError } from "@/lib/auth/session";
import { transactionSchema } from "@/lib/validations/transaction";

export async function GET(req: Request) {
  try {
    const userId = await getAuthenticatedUserId(req);
    const url = new URL(req.url);

    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const type = url.searchParams.get("type"); // "INCOME" | "EXPENSE"
    const categoryId = url.searchParams.get("categoryId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const search = url.searchParams.get("search");

    // Build multi-tenant Prisma `where` clause
    const where: any = { userId };

    if (type === "INCOME" || type === "EXPENSE") {
      where.type = type;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to end of day if only YYYY-MM-DD passed
        const end = new Date(endDate);
        if (endDate.length <= 10) {
          end.setUTCHours(23, 59, 59, 999);
        }
        where.transactionDate.lte = end;
      }
    }

    if (search && search.trim() !== "") {
      where.OR = [
        { merchantName: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [totalCount, transactions] = await prisma.$transaction([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
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
          transactionDate: "desc",
        },
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        transactions,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("GET /api/transactions error:", error);
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

    const result = transactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation error", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { categoryId, amount, type, transactionDate, merchantName, notes } = result.data;

    // Verify category exists and is owned by user or system default (BR-008)
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

    const transaction = await prisma.transaction.create({
      data: {
        userId,
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

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
