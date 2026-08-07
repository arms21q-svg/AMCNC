import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function normalizeConnectionString(raw: string): string {
  const url = raw.trim();
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const isSupabase = parsed.hostname.includes("supabase.com");

    // Transaction pooler (6543) needs pgbouncer mode for Prisma.
    if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    if (isSupabase && !parsed.searchParams.has("sslmode")) {
      parsed.searchParams.set("sslmode", "require");
    }

    if (isSupabase && !parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "30");
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

function getConnectionString(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();

  // Dev/local: direct session URL (5432) is more reliable than transaction pooler.
  if (process.env.NODE_ENV !== "production") {
    return normalizeConnectionString(direct || pooled || "");
  }

  // Production: prefer pooler when configured, with pgbouncer params if needed.
  return normalizeConnectionString(pooled || direct || "");
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
    max: process.env.VERCEL ? 1 : process.env.NODE_ENV === "production" ? 3 : 2,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: process.env.VERCEL ? 30_000 : process.env.NODE_ENV === "production" ? 20_000 : 30_000,
  });
}

function attachPoolErrorHandler(pool: Pool): void {
  pool.on("error", () => {
    // Prevent unhandled pool errors from crashing the dev server.
  });
}

function createPrismaClient(): PrismaClient {
  const pool = createPool();
  attachPoolErrorHandler(pool);
  globalForPrisma.pool = pool;
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function resetPrismaPool(): Promise<void> {
  try {
    await globalForPrisma.prisma?.$disconnect();
  } catch {
    // ignore
  }

  try {
    await globalForPrisma.pool?.end();
  } catch {
    // ignore
  }

  globalForPrisma.prisma = undefined;
  globalForPrisma.pool = undefined;
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
