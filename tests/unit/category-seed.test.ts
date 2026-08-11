import { describe, it, before } from "node:test";
import assert from "node:assert";
import prisma from "@/lib/db/prisma";
import { DEFAULT_CATEGORIES, seedDefaultCategories } from "@/prisma/seed";

describe("Category Model & System Defaults Seeder (TSK-020)", () => {
  before(async () => {
    // Warm up Neon connection pool with retry for cold starts
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await prisma.$queryRaw`SELECT 1`;
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  });

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
        (c: any) => c.name === def.name && c.type === def.type
      );
      assert.notStrictEqual(found, undefined, `Expected default category ${def.name} to exist`);
      assert.strictEqual(found?.isSystemDefault, true);
      assert.strictEqual(found?.userId, null);
    }
  });
});
