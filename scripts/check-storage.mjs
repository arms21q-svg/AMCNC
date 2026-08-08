#!/usr/bin/env node
/**
 * Verify Supabase Storage bucket is reachable.
 * Run: npm run storage:check
 */
import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const root = resolve(import.meta.dirname, "..");
config({ path: resolve(root, ".env.local") });
config({ path: resolve(root, ".env") });

const url =
  process.env.SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const bucket = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "project-images";

if (!url || !key) {
  console.error(
    "❌ Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await supabase.storage.listBuckets();
if (error) {
  console.error("❌ Storage probe failed:", error.message);
  process.exit(1);
}

const exists = data.some((entry) => entry.name === bucket);
console.log(
  JSON.stringify(
    {
      bucket,
      bucketExists: exists,
      buckets: data.map((b) => b.name),
    },
    null,
    2
  )
);

if (!exists) {
  console.error(
    `\n❌ Bucket "${bucket}" not found. Create it in Supabase → Storage → New bucket (Public).`
  );
  process.exit(1);
}

console.log("\n✅ Storage ready for uploads.");
