import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function getConnectionString(): string {
  const direct = process.env.DIRECT_URL;
  const pooled = process.env.DATABASE_URL;

  // Production: prefer transaction pooler when configured.
  if (process.env.NODE_ENV === "production" && pooled) {
    return pooled;
  }

  // Dev/local: session/direct URL (5432) is more reliable than pooler 6543.
  return direct || pooled || "";
}

function createPool(): Pool {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error("DATABASE_URL or DIRECT_URL is required");
  }

  const isSupabase = connectionString.includes("supabase.com");

  return new Pool({
    connectionString,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    max: process.env.NODE_ENV === "production" ? 5 : 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 15_000,
  });
}

function createPrismaClient(): PrismaClient {
  const pool = createPool();
  globalForPrisma.pool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getPrisma(), prop);
  },
});
