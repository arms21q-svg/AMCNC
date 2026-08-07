import { Pool, type PoolConfig } from "pg";

function isSupabaseConnection(connectionString: string): boolean {
  return /supabase\.com/i.test(connectionString);
}

/** Normalize Supabase URLs for node-pg (SSL handled on Pool, not via sslmode=require). */
export function normalizePgConnectionString(raw: string): string {
  const url = raw.trim();
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const isSupabase = isSupabaseConnection(url);

    if (parsed.port === "6543" && !parsed.searchParams.has("pgbouncer")) {
      parsed.searchParams.set("pgbouncer", "true");
    }

    if (isSupabase) {
      // sslmode=require in the URL forces strict cert checks and breaks on Windows/Node.
      parsed.searchParams.delete("sslmode");
    }

    if (isSupabase && !parsed.searchParams.has("connect_timeout")) {
      parsed.searchParams.set("connect_timeout", "30");
    }

    return parsed.toString();
  } catch {
    return url;
  }
}

export function getPgConnectionString(): string {
  const direct = process.env.DIRECT_URL?.trim();
  const pooled = process.env.DATABASE_URL?.trim();

  if (process.env.NODE_ENV !== "production") {
    return normalizePgConnectionString(direct || pooled || "");
  }

  return normalizePgConnectionString(pooled || direct || "");
}

export function createPgPool(connectionString?: string): Pool {
  const resolved = normalizePgConnectionString(
    connectionString || getPgConnectionString()
  );

  if (!resolved) {
    throw new Error("DATABASE_URL or DIRECT_URL is required");
  }

  const isSupabase = isSupabaseConnection(resolved);

  const config: PoolConfig = {
    connectionString: resolved,
    max: process.env.VERCEL ? 1 : process.env.NODE_ENV === "production" ? 3 : 2,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: process.env.VERCEL
      ? 30_000
      : process.env.NODE_ENV === "production"
        ? 20_000
        : 30_000,
  };

  if (isSupabase) {
    config.ssl = { rejectUnauthorized: false };
  }

  return new Pool(config);
}
