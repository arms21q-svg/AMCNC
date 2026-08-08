import "server-only";
import { isStorageConfigured, getStorageBucketName } from "@/lib/storage.server";

export type EnvCheckResult =
  | { ok: true }
  | { ok: false; missing: string[]; hints: string[] };

function readJwtSecret(): string | undefined {
  return (
    process.env.JWT_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    undefined
  );
}

function readDatabaseUrl(): string | undefined {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.DIRECT_URL?.trim() ||
    undefined
  );
}

/** Required for admin login — JWT + database only. */
export function checkAuthEnv(): EnvCheckResult {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true };
  }

  const missing: string[] = [];
  const hints: string[] = [];

  if (!readDatabaseUrl()) {
    missing.push("DATABASE_URL");
    hints.push(
      "Supabase → Database → Connection string → URI → Session pooler port 5432 (no quotes in Vercel)"
    );
  }

  const jwtSecret = readJwtSecret();
  if (!jwtSecret) {
    missing.push("JWT_SECRET");
    hints.push(
      'PowerShell: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  } else if (
    jwtSecret === "dev-secret-change-me" ||
    jwtSecret === "your-super-secret-jwt-key-change-in-production" ||
    jwtSecret.length < 32
  ) {
    missing.push("JWT_SECRET (ضعيف — 32 حرفاً على الأقل)");
    hints.push("لا تستخدم النص من .env.example — ولّد مفتاحاً عشوائياً 64 حرف hex");
  }

  if (missing.length > 0) {
    return { ok: false, missing, hints };
  }

  return { ok: true };
}

/** Full deploy checklist (health endpoint). */
export function checkProductionEnv(): EnvCheckResult & {
  warnings?: string[];
} {
  const auth = checkAuthEnv();
  if (!auth.ok) return auth;

  const warnings: string[] = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelUrl = process.env.VERCEL_URL?.trim();

  if ((!siteUrl || siteUrl.includes("localhost")) && !vercelUrl) {
    warnings.push("NEXT_PUBLIC_SITE_URL — optional but recommended for SEO");
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && !process.env.SUPABASE_URL?.trim()) {
    warnings.push("SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL — required for image uploads");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    warnings.push(
      "SUPABASE_SERVICE_ROLE_KEY — required for image uploads (Supabase → Settings → API)"
    );
  }

  if (!process.env.SUPABASE_STORAGE_BUCKET?.trim()) {
    warnings.push('SUPABASE_STORAGE_BUCKET — optional, default: "project-images"');
  }

  return warnings.length > 0 ? { ok: true, warnings } : { ok: true };
}

export function formatEnvCheckError(
  result: Extract<EnvCheckResult, { ok: false }>
): string {
  return [
    "إعدادات Vercel ناقصة:",
    result.missing.join(" • "),
    "Settings → Environment Variables → Production → ثم Redeploy",
  ].join("\n");
}

export function getConfiguredEnvSummary() {
  return {
    hasDatabase: Boolean(readDatabaseUrl()),
    hasJwt: Boolean(readJwtSecret()),
    jwtLength: readJwtSecret()?.length ?? 0,
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    hasStorage: isStorageConfigured(),
    storageBucket: getStorageBucketName(),
    vercelUrl: process.env.VERCEL_URL ?? null,
    nodeEnv: process.env.NODE_ENV ?? null,
  };
}
