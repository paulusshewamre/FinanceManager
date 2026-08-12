import { describe, it } from "node:test";
import assert from "node:assert";
import { calculateBudgetUsage } from "@/lib/calculations/budget";

describe("Budget Usage & Warning Engine Calculations (TSK-041 / BR-008 / BR-009 / FR-044)", () => {
  it("should calculate NORMAL status when spending is under 80%", () => {
    const result = calculateBudgetUsage(350, 500); // 70%
    assert.strictEqual(result.spent, 350);
    assert.strictEqual(result.limit, 500);
    assert.strictEqual(result.percentage, 70);
    assert.strictEqual(result.remaining, 150);
    assert.strictEqual(result.overrun, 0);
    assert.strictEqual(result.status, "NORMAL");
  });

  it("should calculate NORMAL status at 79.99%", () => {
    const result = calculateBudgetUsage(399.95, 500); // 79.99%
    assert.strictEqual(result.percentage, 79.99);
    assert.strictEqual(result.status, "NORMAL");
  });

  it("should calculate WARNING status (Amber alert) exactly at 80% threshold", () => {
    const result = calculateBudgetUsage(400, 500); // 80.00%
    assert.strictEqual(result.percentage, 80);
    assert.strictEqual(result.remaining, 100);
    assert.strictEqual(result.overrun, 0);
    assert.strictEqual(result.status, "WARNING");
  });

  it("should calculate WARNING status at 99.99%", () => {
    const result = calculateBudgetUsage(499.95, 500); // 99.99%
    assert.strictEqual(result.percentage, 99.99);
    assert.strictEqual(result.status, "WARNING");
  });

  it("should calculate EXCEEDED status (Crimson Red alert) exactly at 100% limit threshold", () => {
    const result = calculateBudgetUsage(500, 500); // 100.00%
    assert.strictEqual(result.percentage, 100);
    assert.strictEqual(result.remaining, 0);
    assert.strictEqual(result.overrun, 0);
    assert.strictEqual(result.status, "EXCEEDED");
  });

  it("should calculate EXCEEDED status and correct overrun amount when over 100%", () => {
    const result = calculateBudgetUsage(650.50, 500); // 130.1%
    assert.strictEqual(result.spent, 650.50);
    assert.strictEqual(result.limit, 500);
    assert.strictEqual(result.percentage, 130.1);
    assert.strictEqual(result.remaining, 0);
    assert.strictEqual(result.overrun, 150.50);
    assert.strictEqual(result.status, "EXCEEDED");
  });
});
