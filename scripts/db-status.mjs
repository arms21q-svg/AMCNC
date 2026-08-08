#!/usr/bin/env node
import { config } from "dotenv";
import { resolve } from "path";
import pg from "pg";

const root = resolve(import.meta.dirname, "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const url = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Missing DIRECT_URL / DATABASE_URL");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: url.replace(/[?&]sslmode=[^&]*/g, "").replace(/\?$/, ""),
  ssl: { rejectUnauthorized: false },
  max: 1,
});

const host = (() => {
  try {
    return new URL(url.replace(/^postgresql:/, "http:")).hostname;
  } catch {
    return "unknown";
  }
})();

try {
  const tables = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name IN ('projects', 'users', 'settings', 'images')
    ORDER BY table_name
  `);

  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*)::int FROM projects) AS projects,
      (SELECT COUNT(*)::int FROM projects WHERE published = true) AS published,
      (SELECT COUNT(*)::int FROM users) AS users,
      (SELECT COUNT(*)::int FROM categories) AS categories
  `);

  console.log(
    JSON.stringify(
      {
        host,
        schemaReady: tables.rows.length >= 4,
        tables: tables.rows.map((r) => r.table_name),
        ...counts.rows[0],
      },
      null,
      2
    )
  );
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const schemaMissing = /does not exist|relation .* does not exist/i.test(message);
  console.log(
    JSON.stringify(
      {
        host,
        schemaReady: false,
        error: schemaMissing
          ? "Schema missing — run: npm run db:migrate:deploy && npm run db:seed"
          : message,
      },
      null,
      2
    )
  );
  process.exit(schemaMissing ? 1 : 1);
} finally {
  await pool.end();
}
