import { describe, it } from "node:test";
import assert from "node:assert";
import { transactionSchema } from "@/lib/validations/transaction";

describe("Transaction Zod Validation Schema", () => {
  it("should validate valid transaction input", () => {
    const valid = transactionSchema.safeParse({
      categoryId: "cat_123",
      amount: "49.99",
      type: "EXPENSE",
      transactionDate: "2026-08-10T12:00:00.000Z",
      merchantName: "Starbucks",
      notes: "Morning coffee",
    });
    assert.strictEqual(valid.success, true);
    if (valid.success) {
      assert.strictEqual(valid.data.amount, 49.99);
      assert.strictEqual(valid.data.type, "EXPENSE");
      assert.strictEqual(valid.data.merchantName, "Starbucks");
    }
  });

  it("should fail on zero or negative amount", () => {
    const zero = transactionSchema.safeParse({
      categoryId: "cat_123",
      amount: 0,
      type: "EXPENSE",
      transactionDate: "2026-08-10",
    });
    assert.strictEqual(zero.success, false);

    const negative = transactionSchema.safeParse({
      categoryId: "cat_123",
      amount: -15.5,
      type: "EXPENSE",
      transactionDate: "2026-08-10",
    });
    assert.strictEqual(negative.success, false);
  });

  it("should fail on invalid categoryId or type", () => {
    const invalidCategory = transactionSchema.safeParse({
      categoryId: "",
      amount: 100,
      type: "INCOME",
      transactionDate: "2026-08-10",
    });
    assert.strictEqual(invalidCategory.success, false);

    const invalidType = transactionSchema.safeParse({
      categoryId: "cat_123",
      amount: 100,
      type: "INVALID",
      transactionDate: "2026-08-10",
    });
    assert.strictEqual(invalidType.success, false);
  });
});
