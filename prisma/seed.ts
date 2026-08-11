import { PrismaClient, CategoryType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString =
  process.env.DATABASE_URL ||
  process.env.DIRECT_URL ||
  process.env.DATABASE_URL_UNPOOLED;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const DEFAULT_CATEGORIES = [
  { name: "Groceries", type: CategoryType.EXPENSE },
  { name: "Utilities", type: CategoryType.EXPENSE },
  { name: "Housing", type: CategoryType.EXPENSE },
  { name: "Salary", type: CategoryType.INCOME },
  { name: "Freelance", type: CategoryType.INCOME },
  { name: "Uncategorized (Expense)", type: CategoryType.EXPENSE },
  { name: "Uncategorized (Income)", type: CategoryType.INCOME },
];

export async function seedDefaultCategories() {
  console.log("Seeding system default categories...");
  for (const category of DEFAULT_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: {
        userId: null,
        name: category.name,
        type: category.type,
        isSystemDefault: true,
      },
    });

    if (!existing) {
      await prisma.category.create({
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
    await pool.end();
  }
}

if (require.main === module) {
  main();
}
