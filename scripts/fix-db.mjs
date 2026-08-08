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

run("Push schema", "npm", ["run", "db:push"]);
run("Seed data", "npm", ["run", "db:seed"]);
run("Status", "node", ["scripts/db-status.mjs"]);

console.log("\n✅ Database fix complete.");
console.log("If Vercel still shows empty projects:");
console.log("1. Copy DATABASE_URL + DIRECT_URL from .env.local to Vercel");
console.log("2. Redeploy on Vercel");
console.log("3. Check https://amcnc.vercel.app/api/health → database.projects\n");
