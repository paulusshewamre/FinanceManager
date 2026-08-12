import dotenv from "dotenv";
dotenv.config();

import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/**
 * Singleton instance of PrismaClient & pg.Pool for Next.js App Router & Prisma v7.
 * Reuses a single pg.Pool instance across HMR reloads to prevent Neon connection pool exhaustion (ETIMEDOUT).
 * Configured with 30s connectionTimeoutMillis to accommodate Neon compute cold-start wake-ups.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
  pool: pg.Pool | undefined;
};

const purgePrismaCache = () => {
  if (typeof require !== "undefined" && require.cache) {
    Object.keys(require.cache).forEach((key) => {
      if (key.includes("@prisma") || key.includes(".prisma")) {
        delete require.cache[key];
      }
    });
  }
};

const getFreshPrismaClientClass = () => {
  if (typeof require !== "undefined") {
    try {
      purgePrismaCache();
      const freshModule = require("@prisma/client");
      if (freshModule && freshModule.PrismaClient) {
        return freshModule.PrismaClient;
      }
    } catch {
      // Fallback if require fails
    }
  }
  const { PrismaClient } = require("@prisma/client");
  return PrismaClient;
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
    max: 3, // Keep max pool size lightweight to avoid Neon PgBouncer pooler saturation
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 30s connection timeout for Neon cold-starts
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return pool;
};

const createPrismaClient = () => {
  const pool = getPgPool();
  const adapter = new PrismaPg(pool);
  const PrismaClientClass = getFreshPrismaClientClass();

  return new PrismaClientClass({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
};

const getPrismaInstance = (propName?: string | symbol): any => {
  if (globalForPrisma.prisma) {
    // If accessing a model property (e.g. transaction, category, budget) that is undefined on cached instance, force cache purge & client recreation
    if (
      typeof propName === "string" &&
      !propName.startsWith("$") &&
      typeof (globalForPrisma.prisma as any)[propName] === "undefined"
    ) {
      console.warn(
        `[Prisma Proxy] Model delegate '${propName}' is undefined on global cached instance. Purging Prisma module cache and recreating client...`
      );
      globalForPrisma.prisma = undefined;
    } else {
      return globalForPrisma.prisma;
    }
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
};

/**
 * Dynamic Proxy wrapper around PrismaClient.
 * Guarantees self-healing client re-instantiation and single pg.Pool reuse across Next.js HMR & dev server reloads.
 */
export const prisma: any = new Proxy({} as any, {
  get(_target, prop) {
    const instance = getPrismaInstance(prop);
    const value = instance[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});

export default prisma;
