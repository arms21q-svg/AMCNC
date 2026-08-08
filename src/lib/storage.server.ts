import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || "project-images";

let supabaseAdmin: SupabaseClient | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  );
}

export function getStorageBucketName(): string {
  return BUCKET;
}

export function getStorageSetupError(): string | null {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) {
    return "NEXT_PUBLIC_SUPABASE_URL غير مضاف في Vercel";
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
    return "SUPABASE_SERVICE_ROLE_KEY غير مضاف في Vercel (Supabase → Settings → API → service_role)";
  }
  return null;
}

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseAdmin;
}

function extensionFromName(name: string, contentType: string): string {
  const fromName = name.split(".").pop()?.toLowerCase();
  if (fromName && ["jpg", "jpeg", "png", "webp", "gif"].includes(fromName)) {
    return fromName === "jpeg" ? "jpg" : fromName;
  }
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  return "jpg";
}

export async function uploadImageBuffer(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  folder = "uploads"
): Promise<string> {
  const ext = extensionFromName(originalName, contentType);
  const filename = `${randomUUID()}.${ext}`;
  const year = new Date().getFullYear().toString();
  const storagePath = `${folder}/${year}/${filename}`;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: false,
    });
    if (error) {
      if (/bucket not found/i.test(error.message)) {
        throw new Error(
          `Bucket "${BUCKET}" غير موجود في Supabase Storage — أنشئه واجعله Public`
        );
      }
      throw new Error(error.message);
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  if (process.env.VERCEL) {
    throw new Error(
      getStorageSetupError() ||
        "تخزين الصور غير مهيأ على Vercel — أضف SUPABASE_SERVICE_ROLE_KEY ثم Redeploy"
    );
  }

  const dir = path.join(process.cwd(), "public", folder, year);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/${folder}/${year}/${filename}`;
}

export async function deleteStoredImage(url: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase && url.includes("supabase.co/storage")) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const storagePath = url.slice(idx + marker.length);
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }
    return;
  }

  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    await fs.unlink(filePath).catch(() => undefined);
  }
}

export async function readImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (url.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const contentType =
      ext === "png"
        ? "image/png"
        : ext === "webp"
          ? "image/webp"
          : ext === "gif"
            ? "image/gif"
            : "image/jpeg";
    return { buffer, contentType };
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch image");
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return { buffer, contentType };
}
