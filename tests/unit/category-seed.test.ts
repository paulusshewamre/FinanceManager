import { describe, it } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { DEFAULT_CATEGORIES, seedDefaultCategories } from "@/prisma/seed";

describe("Category Model & System Defaults Seeder (TSK-020)", () => {
  it("should seed system default categories idempotently", async () => {
    await seedDefaultCategories();

    const systemCategories = await prisma.category.findMany({
      where: { isSystemDefault: true, userId: null },
    });

    assert.strictEqual(
      systemCategories.length >= DEFAULT_CATEGORIES.length,
      true,
      "Expected system default categories to be present in database"
    );

    for (const def of DEFAULT_CATEGORIES) {
      const found = systemCategories.find(
        (c) => c.name === def.name && c.type === def.type
      );
      assert.notStrictEqual(found, undefined, `Expected default category ${def.name} to exist`);
      assert.strictEqual(found?.isSystemDefault, true);
      assert.strictEqual(found?.userId, null);
    }
  });
});
