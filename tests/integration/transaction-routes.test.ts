import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { GET, POST } from "@/app/api/transactions/route";
import { PUT, DELETE } from "@/app/api/transactions/[id]/route";
import { auth } from "@/lib/auth/auth";
import { CategoryTypeEnum } from "@/lib/validations/category";

describe("Transaction API Routes (TSK-031)", () => {
  let userA: { id: string; cookie: string };
  let userB: { id: string; cookie: string };
  let categoryExpense: { id: string };
  let categoryIncome: { id: string };
  let createdTransactionId: string;

  before(async () => {
    // Warm up Neon connection pool
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    // Register User A
    const emailA = `txn-user-a-${Date.now()}@example.com`;
    const resA = await auth.api.signUpEmail({
      body: { email: emailA, password: "password123", name: "User A" },
      asResponse: true,
    });
    const cookieA = resA.headers.get("set-cookie") || "";
    const dbUserA = await prisma.user.findUnique({ where: { email: emailA } });
    userA = { id: dbUserA!.id, cookie: cookieA };

    // Register User B
    const emailB = `txn-user-b-${Date.now()}@example.com`;
    const resB = await auth.api.signUpEmail({
      body: { email: emailB, password: "password123", name: "User B" },
      asResponse: true,
    });
    const cookieB = resB.headers.get("set-cookie") || "";
    const dbUserB = await prisma.user.findUnique({ where: { email: emailB } });
    userB = { id: dbUserB!.id, cookie: cookieB };

    // Fetch system default categories
    const expense = await prisma.category.findFirst({
      where: { isSystemDefault: true, type: CategoryTypeEnum.EXPENSE },
    });
    const income = await prisma.category.findFirst({
      where: { isSystemDefault: true, type: CategoryTypeEnum.INCOME },
    });
    categoryExpense = { id: expense!.id };
    categoryIncome = { id: income!.id };
  });

  after(async () => {
    // Cleanup created test records
    if (userA?.id) {
      await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
    }
    if (userB?.id) {
      await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
    }
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    const res = await GET(new Request("http://localhost:3000/api/transactions"));
    assert.strictEqual(res.status, 401);
  });

  it("POST /api/transactions creates a transaction when authenticated", async () => {
    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        categoryId: categoryExpense.id,
        amount: 85.5,
        type: CategoryTypeEnum.EXPENSE,
        transactionDate: "2026-08-01T10:00:00.000Z", // Backdated entry
        merchantName: "Whole Foods Market",
        notes: "Weekly grocery restock",
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 201);
    const body = await res.json();

    assert.ok(body.id);
    assert.strictEqual(body.userId, userA.id);
    assert.strictEqual(Number(body.amount), 85.5);
    assert.strictEqual(body.merchantName, "Whole Foods Market");
    assert.strictEqual(body.category.name, "Groceries");

    createdTransactionId = body.id;
  });

  it("POST /api/transactions rejects category type mismatch (BR-003)", async () => {
    const req = new Request("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        categoryId: categoryIncome.id, // Income category
        amount: 100,
        type: CategoryTypeEnum.EXPENSE, // Expense transaction
        transactionDate: "2026-08-01",
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.ok(body.error.includes("does not match"));
  });

  it("GET /api/transactions returns paginated list and filters by search/type", async () => {
    const req = new Request(
      "http://localhost:3000/api/transactions?type=EXPENSE&search=Whole",
      {
        headers: { Cookie: userA.cookie },
      }
    );

    const res = await GET(req);
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(body.transactions.length, 1);
    assert.strictEqual(body.transactions[0].merchantName, "Whole Foods Market");
    assert.strictEqual(body.pagination.page, 1);
    assert.strictEqual(body.pagination.totalCount, 1);
  });

  it("PUT /api/transactions/[id] updates backdated transaction", async () => {
    const req = new Request(
      `http://localhost:3000/api/transactions/${createdTransactionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: userA.cookie,
        },
        body: JSON.stringify({
          categoryId: categoryExpense.id,
          amount: 92.75,
          type: CategoryTypeEnum.EXPENSE,
          transactionDate: "2026-08-02T15:00:00.000Z",
          merchantName: "Whole Foods Market - Organic",
          notes: "Updated restock notes",
        }),
      }
    );

    const params = Promise.resolve({ id: createdTransactionId });
    const res = await PUT(req, { params });
    assert.strictEqual(res.status, 200);
    const body = await res.json();

    assert.strictEqual(Number(body.amount), 92.75);
    assert.strictEqual(body.merchantName, "Whole Foods Market - Organic");
  });

  it("PUT /api/transactions/[id] prevents User B from modifying User A's transaction (Multi-tenant lock)", async () => {
    const req = new Request(
      `http://localhost:3000/api/transactions/${createdTransactionId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: userB.cookie,
        },
        body: JSON.stringify({
          categoryId: categoryExpense.id,
          amount: 500,
          type: CategoryTypeEnum.EXPENSE,
          transactionDate: "2026-08-02",
        }),
      }
    );

    const params = Promise.resolve({ id: createdTransactionId });
    const res = await PUT(req, { params });
    assert.strictEqual(res.status, 403);
  });

  it("DELETE /api/transactions/[id] deletes custom transaction", async () => {
    const req = new Request(
      `http://localhost:3000/api/transactions/${createdTransactionId}`,
      {
        method: "DELETE",
        headers: { Cookie: userA.cookie },
      }
    );

    const params = Promise.resolve({ id: createdTransactionId });
    const res = await DELETE(req, { params });
    assert.strictEqual(res.status, 200);

    const check = await prisma.transaction.findUnique({
      where: { id: createdTransactionId },
    });
    assert.strictEqual(check, null);
  });
});
