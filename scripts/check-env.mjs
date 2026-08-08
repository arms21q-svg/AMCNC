#!/usr/bin/env node
/**
 * Checks local .env and prints Vercel setup instructions.
 * Run: node scripts/check-env.mjs
 */
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const recommended = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_WHATSAPP_PHONE",
];

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "JWT_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
];

function maskUrl(url) {
  if (!url) return "(missing)";
  return url.replace(/:([^:@/]+)@/, ":****@");
}

function status(key) {
  const val = process.env[key]?.trim();
  if (!val) return "❌ missing";
  if (key === "JWT_SECRET" && val.length < 32) return `⚠️ too short (${val.length} chars, need 32+)`;
  if (key.includes("URL") && key !== "NEXT_PUBLIC_SITE_URL") return `✅ ${maskUrl(val)}`;
  if (key === "JWT_SECRET") return `✅ set (${val.length} chars)`;
  return `✅ set`;
}

console.log("\n=== Local .env check ===\n");

for (const key of required) {
  console.log(`${key}: ${status(key)}`);
}

console.log("\n--- Recommended ---");
for (const key of recommended) {
  const val = process.env[key]?.trim();
  if (val) console.log(`${key}: ✅`);
  else console.log(`${key}: (optional)`);
}

const missing = required.filter((k) => !process.env[k]?.trim());
const weakJwt =
  process.env.JWT_SECRET?.trim() &&
  process.env.JWT_SECRET.trim().length < 32;

if (missing.length || weakJwt) {
  console.log("\n=== Fix locally first ===\n");
  if (missing.includes("JWT_SECRET") || weakJwt) {
    console.log("Generate JWT_SECRET:");
    console.log('  node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
    console.log("Add to .env: JWT_SECRET=<64-char-hex>\n");
  }
}

console.log("=== Vercel (Production) — copy from .env ===\n");
console.log("1. vercel.com → AMCNC → Settings → Environment Variables");
console.log("2. Add each KEY below — paste VALUE without quote marks");
console.log("3. Check: Production ✅");
console.log("4. Deployments → Redeploy\n");

for (const key of [...required, ...recommended.filter((k) => process.env[k]?.trim())]) {
  if (process.env[key]?.trim()) {
    console.log(`   ${key}`);
  }
}

console.log("\n5. Verify: https://YOUR-SITE.vercel.app/api/health");
console.log('   Expect: "status":"ok"\n');

if (!existsSync(resolve(root, ".env"))) {
  console.log("⚠️  No .env file found in project root.\n");
}
