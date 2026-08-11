import { describe, it } from "node:test";
import assert from "node:assert";
import { categorySchema, CategoryTypeEnum } from "@/lib/validations/category";

describe("Category Zod Validation Schema", () => {
  it("should validate valid category input", () => {
    const valid = categorySchema.safeParse({
      name: "   Entertainment   ",
      type: CategoryTypeEnum.EXPENSE,
    });
    assert.strictEqual(valid.success, true);
    if (valid.success) {
      assert.strictEqual(valid.data.name, "Entertainment");
      assert.strictEqual(valid.data.type, "EXPENSE");
    }
  });

  it("should fail on empty category name", () => {
    const invalid = categorySchema.safeParse({
      name: "   ",
      type: CategoryTypeEnum.EXPENSE,
    });
    assert.strictEqual(invalid.success, false);
  });

  it("should fail on category name exceeding 50 characters", () => {
    const invalid = categorySchema.safeParse({
      name: "A".repeat(51),
      type: CategoryTypeEnum.EXPENSE,
    });
    assert.strictEqual(invalid.success, false);
  });

  it("should fail on invalid category type", () => {
    const invalid = categorySchema.safeParse({
      name: "Test",
      type: "INVALID_TYPE",
    });
    assert.strictEqual(invalid.success, false);
  });
});
