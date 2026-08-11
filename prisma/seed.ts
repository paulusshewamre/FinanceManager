import { CategoryType } from "@prisma/client";
import prisma from "@/lib/db/prisma";

export const DEFAULT_CATEGORIES = [
  { name: "Groceries", type: CategoryType.EXPENSE },
  { name: "Utilities", type: CategoryType.EXPENSE },
  { name: "Housing", type: CategoryType.EXPENSE },
  { name: "Salary", type: CategoryType.INCOME },
  { name: "Freelance", type: CategoryType.INCOME },
  { name: "Uncategorized (Expense)", type: CategoryType.EXPENSE },
  { name: "Uncategorized (Income)", type: CategoryType.INCOME },
];

export async function seedDefaultCategories(client = prisma) {
  console.log("Seeding system default categories...");
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await client.category.findFirst({
      where: {
        userId: null,
        name: category.name,
        type: category.type,
        isSystemDefault: true,
      },
    });

    if (!existing) {
      await client.category.create({
        data: {
          name: category.name,
          type: category.type,
          isSystemDefault: true,
          userId: null,
        },
      });
      console.log(`Created default category: ${category.name} (${category.type})`);
    } else {
      console.log(`Default category already exists: ${category.name} (${category.type})`);
    }
  }
  console.log("System default categories seeding complete.");
}

async function main() {
  try {
    await seedDefaultCategories();
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}
