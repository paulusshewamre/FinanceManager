import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { CategoryTypeEnum } from "@/lib/validations/category";

describe("Transaction Prisma Schema (TSK-030)", () => {
  let testUserId: string;
  let testCategoryId: string;
  let createdTransactionId: string;

  before(async () => {
    // Connection pool warmup
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }

    // Create a temporary test user
    const testUser = await prisma.user.create({
      data: {
        email: `schema-test-${Date.now()}@example.com`,
        name: "Schema Test User",
      },
    });
    testUserId = testUser.id;

    // Fetch or create a category for this test user
    const category = await prisma.category.create({
      data: {
        name: "Test Dining",
        type: CategoryTypeEnum.EXPENSE,
        userId: testUserId,
      },
    });
    testCategoryId = category.id;
  });

  after(async () => {
    // Cleanup created test records
    if (createdTransactionId) {
      await prisma.transaction.delete({ where: { id: createdTransactionId } }).catch(() => {});
    }
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  it("should create a valid Transaction record with exact Decimal precision", async () => {
    const amount = 49.99;
    const transactionDate = new Date("2026-08-10T14:30:00.000Z");

    const transaction = await prisma.transaction.create({
      data: {
        userId: testUserId,
        categoryId: testCategoryId,
        amount,
        type: CategoryTypeEnum.EXPENSE,
        transactionDate,
        merchantName: "Sweetgreen",
        notes: "Lunch meeting",
      },
    });

    createdTransactionId = transaction.id;

    assert.ok(transaction.id, "Expected transaction ID to be generated");
    assert.strictEqual(transaction.userId, testUserId);
    assert.strictEqual(transaction.categoryId, testCategoryId);
    assert.strictEqual(Number(transaction.amount), 49.99);
    assert.strictEqual(transaction.type, CategoryTypeEnum.EXPENSE);
    assert.strictEqual(transaction.merchantName, "Sweetgreen");
    assert.strictEqual(transaction.notes, "Lunch meeting");
    assert.strictEqual(
      transaction.transactionDate.toISOString(),
      transactionDate.toISOString()
    );
  });

  it("should query transactions using the multi-tenant index", async () => {
    const results = await prisma.transaction.findMany({
      where: {
        userId: testUserId,
      },
      include: {
        category: true,
      },
      orderBy: {
        transactionDate: "desc",
      },
    });

    assert.strictEqual(results.length, 1);
    assert.strictEqual(results[0].category.name, "Test Dining");
  });
});
