import dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "@prisma/client";

/**
 * Singleton instance of PrismaClient & pg.Pool for Next.js App Router & Prisma v7.
 * Reuses a single pg.Pool and PrismaClient instance across HMR reloads and serverless warm invocations.
 * Includes build-safe fallback to prevent static route analysis failures when DATABASE_URL is not set at build time.
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
    process.env.DATABASE_URL_UNPOOLED ||
    "postgresql://placeholder:placeholder@localhost:5432/placeholder";

  const pool = new pg.Pool({
    connectionString,
    ssl: connectionString.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    max: 10, // Accommodate parallel Promise.all queries without pool queue timeouts
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 30s connection timeout for Neon cold-starts
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  globalForPrisma.pool = pool;
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
globalForPrisma.prisma = prisma;

export default prisma;
