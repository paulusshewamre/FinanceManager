import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { GET, POST } from "@/app/api/budgets/route";
import { PUT, DELETE } from "@/app/api/budgets/[id]/route";
import { auth } from "@/lib/auth/auth";
import { CategoryTypeEnum } from "@/lib/validations/category";

describe("Budget API Routes & Warning Calculation Engine (TSK-041)", () => {
  let userA: { id: string; cookie: string };
  let userB: { id: string; cookie: string };
  let categoryExpense: { id: string };
  let categoryIncome: { id: string };
  let createdBudgetId: string;

  before(async () => {
    // Warm up connection pool
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 5) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    // Register User A
    const emailA = `budget-user-a-${Date.now()}@example.com`;
    const resA = await auth.api.signUpEmail({
      body: { email: emailA, password: "password123", name: "User A" },
      asResponse: true,
    });
    const cookieA = resA.headers.get("set-cookie") || "";
    const dbUserA = await prisma.user.findUnique({ where: { email: emailA } });
    userA = { id: dbUserA!.id, cookie: cookieA };

    // Register User B
    const emailB = `budget-user-b-${Date.now()}@example.com`;
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
    if (userA?.id) {
      await prisma.transaction.deleteMany({ where: { userId: userA.id } }).catch(() => {});
      await prisma.budget.deleteMany({ where: { userId: userA.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: userA.id } }).catch(() => {});
    }
    if (userB?.id) {
      await prisma.transaction.deleteMany({ where: { userId: userB.id } }).catch(() => {});
      await prisma.budget.deleteMany({ where: { userId: userB.id } }).catch(() => {});
      await prisma.user.delete({ where: { id: userB.id } }).catch(() => {});
    }
  });

  it("returns 401 Unauthorized for unauthenticated requests", async () => {
    const res = await GET(new Request("http://localhost:3000/api/budgets"));
    assert.strictEqual(res.status, 401);
  });

  it("POST /api/budgets prevents creating budget for INCOME category (BR-007)", async () => {
    const req = new Request("http://localhost:3000/api/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        categoryId: categoryIncome.id,
        amount: 1000,
        month: 8,
        year: 2026,
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 400);
    const body = await res.json();
    assert.strictEqual(body.error, "Budgets can only be set for EXPENSE categories");
  });

  it("POST /api/budgets creates a budget for an EXPENSE category when authenticated", async () => {
    const req = new Request("http://localhost:3000/api/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        categoryId: categoryExpense.id,
        amount: 500,
        month: 8,
        year: 2026,
      }),
    });

    const res = await POST(req);
    assert.strictEqual(res.status, 201);
    const body = await res.json();

    assert.ok(body.id);
    createdBudgetId = body.id;
    assert.strictEqual(body.userId, userA.id);
    assert.strictEqual(body.categoryId, categoryExpense.id);
    assert.strictEqual(body.amount, 500);
    assert.strictEqual(body.month, 8);
    assert.strictEqual(body.year, 2026);
  });

  it("GET /api/budgets aggregates actual spending and computes status transitions (NORMAL -> WARNING -> EXCEEDED)", async () => {
    // Initial fetch: 0 spent against 500 limit -> NORMAL
    const reqGet1 = new Request("http://localhost:3000/api/budgets?month=8&year=2026", {
      headers: { Cookie: userA.cookie },
    });
    const resGet1 = await GET(reqGet1);
    assert.strictEqual(resGet1.status, 200);
    const body1 = await resGet1.json();
    assert.strictEqual(body1.budgets.length, 1);
    assert.strictEqual(body1.budgets[0].spent, 0);
    assert.strictEqual(body1.budgets[0].remaining, 500);
    assert.strictEqual(body1.budgets[0].percentage, 0);
    assert.strictEqual(body1.budgets[0].status, "NORMAL");

    // Add transaction 1: $350 spent -> 70% -> NORMAL
    await prisma.transaction.create({
      data: {
        userId: userA.id,
        categoryId: categoryExpense.id,
        amount: 350,
        type: CategoryTypeEnum.EXPENSE,
        transactionDate: new Date("2026-08-10T12:00:00.000Z"),
      },
    });

    const resGet2 = await GET(new Request("http://localhost:3000/api/budgets?month=8&year=2026", {
      headers: { Cookie: userA.cookie },
    }));
    const body2 = await resGet2.json();
    assert.strictEqual(body2.budgets[0].spent, 350);
    assert.strictEqual(body2.budgets[0].remaining, 150);
    assert.strictEqual(body2.budgets[0].percentage, 70);
    assert.strictEqual(body2.budgets[0].status, "NORMAL");

    // Add transaction 2: +$60 ($410 spent against $500 = 82%) -> WARNING (Amber alert badge)
    await prisma.transaction.create({
      data: {
        userId: userA.id,
        categoryId: categoryExpense.id,
        amount: 60,
        type: CategoryTypeEnum.EXPENSE,
        transactionDate: new Date("2026-08-15T14:00:00.000Z"),
      },
    });

    const resGet3 = await GET(new Request("http://localhost:3000/api/budgets?month=8&year=2026", {
      headers: { Cookie: userA.cookie },
    }));
    const body3 = await resGet3.json();
    assert.strictEqual(body3.budgets[0].spent, 410);
    assert.strictEqual(body3.budgets[0].remaining, 90);
    assert.strictEqual(body3.budgets[0].percentage, 82);
    assert.strictEqual(body3.budgets[0].status, "WARNING");

    // Add transaction 3: +$140 ($550 spent against $500 = 110%) -> EXCEEDED (Crimson Red alert badge)
    await prisma.transaction.create({
      data: {
        userId: userA.id,
        categoryId: categoryExpense.id,
        amount: 140,
        type: CategoryTypeEnum.EXPENSE,
        transactionDate: new Date("2026-08-20T16:00:00.000Z"),
      },
    });

    const resGet4 = await GET(new Request("http://localhost:3000/api/budgets?month=8&year=2026", {
      headers: { Cookie: userA.cookie },
    }));
    const body4 = await resGet4.json();
    assert.strictEqual(body4.budgets[0].spent, 550);
    assert.strictEqual(body4.budgets[0].remaining, 0);
    assert.strictEqual(body4.budgets[0].overrun, 50);
    assert.strictEqual(body4.budgets[0].percentage, 110);
    assert.strictEqual(body4.budgets[0].status, "EXCEEDED");
  });

  it("PUT /api/budgets/[id] updates budget limit and recalculates warning status", async () => {
    // Increase limit from 500 to 700 ($550 spent against $700 = 78.57%) -> back to NORMAL
    const reqPut = new Request(`http://localhost:3000/api/budgets/${createdBudgetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: userA.cookie,
      },
      body: JSON.stringify({
        categoryId: categoryExpense.id,
        amount: 700,
        month: 8,
        year: 2026,
      }),
    });

    const resPut = await PUT(reqPut, { params: Promise.resolve({ id: createdBudgetId }) });
    assert.strictEqual(resPut.status, 200);
    const bodyPut = await resPut.json();
    assert.strictEqual(bodyPut.amount, 700);

    const resGet = await GET(new Request("http://localhost:3000/api/budgets?month=8&year=2026", {
      headers: { Cookie: userA.cookie },
    }));
    const bodyGet = await resGet.json();
    assert.strictEqual(bodyGet.budgets[0].amount, 700);
    assert.strictEqual(bodyGet.budgets[0].spent, 550);
    assert.strictEqual(bodyGet.budgets[0].status, "NORMAL");
  });

  it("PUT /api/budgets/[id] prevents User B from modifying User A's budget (Multi-tenant boundary lock)", async () => {
    const reqPut = new Request(`http://localhost:3000/api/budgets/${createdBudgetId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: userB.cookie, // User B trying to edit User A's budget
      },
      body: JSON.stringify({
        categoryId: categoryExpense.id,
        amount: 1000,
        month: 8,
        year: 2026,
      }),
    });

    const res = await PUT(reqPut, { params: Promise.resolve({ id: createdBudgetId }) });
    assert.strictEqual(res.status, 404);
  });

  it("DELETE /api/budgets/[id] prevents User B from deleting User A's budget (Multi-tenant boundary lock)", async () => {
    const reqDelete = new Request(`http://localhost:3000/api/budgets/${createdBudgetId}`, {
      method: "DELETE",
      headers: { Cookie: userB.cookie },
    });

    const res = await DELETE(reqDelete, { params: Promise.resolve({ id: createdBudgetId }) });
    assert.strictEqual(res.status, 404);
  });

  it("DELETE /api/budgets/[id] deletes user budget when authenticated owner", async () => {
    const reqDelete = new Request(`http://localhost:3000/api/budgets/${createdBudgetId}`, {
      method: "DELETE",
      headers: { Cookie: userA.cookie },
    });

    const res = await DELETE(reqDelete, { params: Promise.resolve({ id: createdBudgetId }) });
    assert.strictEqual(res.status, 200);

    const checkDb = await prisma.budget.findUnique({ where: { id: createdBudgetId } });
    assert.strictEqual(checkDb, null);
  });
});
