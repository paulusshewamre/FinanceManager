import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { CategoryTypeEnum } from "@/lib/validations/category";

describe("Budget Prisma Schema (TSK-040)", () => {
  let testUserId: string;
  let testCategoryId: string;
  let createdBudgetId: string;

  before(async () => {
    // Connection pool warmup
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 5) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    // Create a temporary test user
    const testUser = await prisma.user.create({
      data: {
        email: `budget-schema-test-${Date.now()}@example.com`,
        name: "Budget Schema Test User",
      },
    });
    testUserId = testUser.id;

    // Create a category for this test user
    const category = await prisma.category.create({
      data: {
        name: "Test Groceries Budget",
        type: CategoryTypeEnum.EXPENSE,
        userId: testUserId,
      },
    });
    testCategoryId = category.id;
  });

  after(async () => {
    // Explicit child-to-parent cleanup for test records
    if (testUserId) {
      await prisma.budget.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.category.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  it("should create a valid Budget record with exact Decimal precision", async () => {
    const amount = 500.00;
    const month = 8;
    const year = 2026;

    const budget = await prisma.budget.create({
      data: {
        userId: testUserId,
        categoryId: testCategoryId,
        amount,
        month,
        year,
      },
    });

    createdBudgetId = budget.id;

    assert.ok(budget.id, "Expected budget ID to be generated");
    assert.strictEqual(budget.userId, testUserId);
    assert.strictEqual(budget.categoryId, testCategoryId);
    assert.strictEqual(Number(budget.amount), 500.00);
    assert.strictEqual(budget.month, 8);
    assert.strictEqual(budget.year, 2026);
  });

  it("should enforce unique constraint @@unique([userId, categoryId, month, year])", async () => {
    await assert.rejects(
      async () => {
        await prisma.budget.create({
          data: {
            userId: testUserId,
            categoryId: testCategoryId,
            amount: 750.00,
            month: 8,
            year: 2026,
          },
        });
      },
      (err: any) => {
        // Prisma unique constraint error code is P2002
        return err.code === "P2002";
      },
      "Expected P2002 unique constraint violation when creating duplicate budget for same category and calendar month"
    );
  });
});
