import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { SavingsGoalStatus } from "@prisma/client";

describe("Savings Goal Prisma Schema (TSK-050)", () => {
  let testUserId: string;

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
        email: `savings-schema-test-${Date.now()}@example.com`,
        name: "Savings Schema Test User",
      },
    });
    testUserId = testUser.id;
  });

  after(async () => {
    // Explicit cleanup
    if (testUserId) {
      await prisma.savingsGoal.deleteMany({ where: { userId: testUserId } }).catch(() => {});
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
  });

  it("should create a valid SavingsGoal record with exact Decimal precision and default status", async () => {
    const targetAmount = 1500.50;
    const targetDate = new Date("2026-12-31T00:00:00.000Z");

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: testUserId,
        name: "Emergency Fund",
        targetAmount,
        targetDate,
      },
    });

    assert.ok(goal.id, "Expected savings goal ID to be generated");
    assert.strictEqual(goal.userId, testUserId);
    assert.strictEqual(goal.name, "Emergency Fund");
    assert.strictEqual(Number(goal.targetAmount), 1500.50);
    assert.strictEqual(Number(goal.accumulatedBalance), 0.00);
    assert.strictEqual(goal.status, SavingsGoalStatus.IN_PROGRESS);
  });

  it("should support custom accumulatedBalance and status updates", async () => {
    const targetAmount = 500.00;
    const targetDate = new Date("2026-09-30T00:00:00.000Z");

    const goal = await prisma.savingsGoal.create({
      data: {
        userId: testUserId,
        name: "New Laptop",
        targetAmount,
        accumulatedBalance: 500.00,
        status: SavingsGoalStatus.COMPLETED,
        targetDate,
      },
    });

    assert.ok(goal.id);
    assert.strictEqual(goal.name, "New Laptop");
    assert.strictEqual(Number(goal.targetAmount), 500.00);
    assert.strictEqual(Number(goal.accumulatedBalance), 500.00);
    assert.strictEqual(goal.status, SavingsGoalStatus.COMPLETED);
  });
});
