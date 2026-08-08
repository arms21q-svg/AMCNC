#!/usr/bin/env node
/**
 * Sync schema + seed + print status.
 * Run: npm run db:fix
 */
import { spawnSync } from "child_process";
import { resolve } from "path";

const root = resolve(import.meta.dirname, "..");

function run(label, cmd, args) {
  console.log(`\n=== ${label} ===\n`);
  const result = spawnSync(cmd, args, { cwd: root, stdio: "inherit", shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("Migrate schema", "npm", ["run", "db:migrate:deploy"]);
run("Seed data", "npm", ["run", "db:seed"]);
run("Status", "node", ["scripts/db-status.mjs"]);

console.log("\n✅ Database fix complete.");
console.log("If Vercel still shows Prisma errors:");
console.log("1. Copy DATABASE_URL + DIRECT_URL from .env.local to Vercel");
console.log("2. Redeploy — build runs prisma migrate deploy automatically");
console.log("3. Check https://amcnc.vercel.app/api/health → database.schemaReady: true\n");
