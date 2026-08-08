#!/usr/bin/env node
/**
 * Verify (and optionally create) Supabase Storage bucket project-images.
 * Run: npm run storage:check
 * Create: npm run storage:setup
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
const bucket = "project-images";
const shouldCreate = process.argv.includes("--create");

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

let exists = data.some((entry) => entry.name === bucket);

if (!exists && shouldCreate) {
  const { error: createError } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });
  if (createError && !/already exists/i.test(createError.message)) {
    console.error("❌ Failed to create bucket:", createError.message);
    process.exit(1);
  }
  exists = true;
  console.log(`✅ Created public bucket "${bucket}"`);
}

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
    `\n❌ Bucket "${bucket}" not found. Run: npm run storage:setup`
  );
  process.exit(1);
}

console.log("\n✅ Storage ready for uploads.");
