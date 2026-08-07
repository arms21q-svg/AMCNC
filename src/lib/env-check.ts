import "server-only";

export type EnvCheckResult =
  | { ok: true }
  | { ok: false; missing: string[]; hints: string[] };

export function checkProductionEnv(): EnvCheckResult {
  if (process.env.NODE_ENV !== "production") {
    return { ok: true };
  }

  const missing: string[] = [];
  const hints: string[] = [];

  const databaseUrl = process.env.DATABASE_URL?.trim();
  const directUrl = process.env.DIRECT_URL?.trim();
  if (!databaseUrl && !directUrl) {
    missing.push("DATABASE_URL");
    hints.push(
      "Supabase → Settings → Database → Connection string → Session pooler → port 5432"
    );
  }

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    missing.push("JWT_SECRET");
    hints.push("Generate: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"");
  } else if (jwtSecret === "dev-secret-change-me" || jwtSecret.length < 32) {
    missing.push("JWT_SECRET (too weak — need 32+ characters)");
    hints.push("Use a random 32+ character string, not the example from .env.example");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl || siteUrl.includes("localhost")) {
    missing.push("NEXT_PUBLIC_SITE_URL");
    hints.push("Set to your Vercel URL, e.g. https://your-project.vercel.app");
  }

  if (missing.length > 0) {
    return { ok: false, missing, hints };
  }

  return { ok: true };
}

export function formatEnvCheckError(result: Extract<EnvCheckResult, { ok: false }>): string {
  const lines = [
    "Server configuration error on Vercel.",
    `Missing or invalid: ${result.missing.join(", ")}.`,
    "Vercel → Project → Settings → Environment Variables → add them for Production, then Redeploy.",
  ];
  if (result.hints.length > 0) {
    lines.push(result.hints[0]);
  }
  return lines.join(" ");
}
