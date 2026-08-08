import "server-only";
import { resetPrismaPool } from "@/lib/prisma";
import { isPrismaSchemaMissingError } from "@/lib/prisma-errors";

const isDev = process.env.NODE_ENV !== "production";
const QUERY_TIMEOUT_MS = isDev ? 30_000 : 15_000;
const CIRCUIT_OPEN_MS = isDev ? 30_000 : 120_000;

let dbUnavailableUntil = 0;
let dbWarned = false;

function markDbUnavailable(): void {
  dbUnavailableUntil = Date.now() + CIRCUIT_OPEN_MS;
}

function isDbCircuitOpen(): boolean {
  return Date.now() < dbUnavailableUntil;
}

function isConnectionError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return /timeout exceeded|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|Connection terminated|Can't reach database|Connection refused|Query timeout/i.test(
      String(error)
    );
  }

  const err = error as { message?: string; code?: string; cause?: unknown };
  const message = err.message || "";
  const code = err.code || "";

  if (
    /timeout exceeded|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|Connection terminated|Can't reach database|Connection refused|Query timeout/i.test(
      message
    )
  ) {
    return true;
  }

  if (/ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND/.test(code)) {
    return true;
  }

  if (err.cause) {
    return isConnectionError(err.cause);
  }

  return false;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error("Query timeout")),
          ms
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function isSchemaMissingError(error: unknown): boolean {
  return isPrismaSchemaMissingError(error);
}

function warnDbUnavailable(): void {
  if (dbWarned || !isDev) return;
  dbWarned = true;
}

export async function safeDbQuery<T>(
  query: () => Promise<T>,
  fallback: T,
  label = "db"
): Promise<T> {
  if (isDbCircuitOpen()) {
    return fallback;
  }

  try {
    const result = await withTimeout(query(), QUERY_TIMEOUT_MS);
    dbWarned = false;
    return result;
  } catch (error) {
    if (!isConnectionError(error) && !isSchemaMissingError(error)) {
      console.error(`[${label}]`, error);
      return fallback;
    }

    if (isSchemaMissingError(error)) {
      console.error(
        `[${label}] Database schema missing — run npm run db:migrate:deploy`
      );
      return fallback;
    }

    markDbUnavailable();
    warnDbUnavailable();
    await resetPrismaPool();
    return fallback;
  }
}
