import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Pool } from "pg";
import { createPgPool } from "@/lib/pg-pool";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function attachPoolErrorHandler(pool: Pool): void {
  pool.on("error", () => {
    // Prevent unhandled pool errors from crashing the dev server.
  });
}

function createPrismaClient(): PrismaClient {
  const pool = createPgPool();
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
