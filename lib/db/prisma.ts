import dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton instance of PrismaClient & pg.Pool for Next.js App Router & Prisma v7.
 * Reuses a single pg.Pool and PrismaClient instance across HMR reloads.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

const getPgPool = (): pg.Pool => {
  if (globalForPrisma.pool) {
    return globalForPrisma.pool;
  }

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
    max: 10, // Accommodate parallel Promise.all queries without pool queue timeouts
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 30s connection timeout for Neon cold-starts
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return pool;
};

const createPrismaClient = (): PrismaClient => {
  const pool = getPgPool();
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
