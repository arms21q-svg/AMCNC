import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "project-images";

let supabaseAdmin: SupabaseClient | null = null;

export class StorageError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly httpStatus = 503
  ) {
    super(message);
    this.name = "StorageError";
  }
}

/** Server-side Supabase URL — never expose service role to the client. */
export function getSupabaseServerUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    undefined
  );
}

function getSupabaseServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || undefined;
}

export function isStorageConfigured(): boolean {
  return Boolean(getSupabaseServerUrl() && getSupabaseServiceRoleKey());
}

export function getStorageBucketName(): string {
  return BUCKET;
}

export function getStorageSetupError(): string | null {
  if (!getSupabaseServerUrl()) {
    return "SUPABASE_URL أو NEXT_PUBLIC_SUPABASE_URL غير مضاف في Vercel";
  }
  if (!getSupabaseServiceRoleKey()) {
    return "SUPABASE_SERVICE_ROLE_KEY غير مضاف في Vercel (Supabase → Settings → API → service_role)";
  }
  return null;
}

function getSupabaseAdmin(): SupabaseClient {
  const setupError = getStorageSetupError();
  if (setupError) {
    throw new StorageError(setupError, "STORAGE_NOT_CONFIGURED", 503);
  }

  const url = getSupabaseServerUrl()!;
  const key = getSupabaseServiceRoleKey()!;

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

function mapSupabaseUploadError(message: string): StorageError {
  if (/bucket not found/i.test(message)) {
    return new StorageError(
      `Bucket "${BUCKET}" غير موجود — أنشئه في Supabase Storage واجعله Public`,
      "BUCKET_NOT_FOUND",
      503
    );
  }
  if (/invalid api key|jwt|unauthorized/i.test(message)) {
    return new StorageError(
      "SUPABASE_SERVICE_ROLE_KEY غير صحيح — راجع Supabase → Settings → API",
      "STORAGE_AUTH_FAILED",
      503
    );
  }
  if (/payload too large|entity too large|413/i.test(message)) {
    return new StorageError("حجم الملف أكبر من الحد المسموح", "FILE_TOO_LARGE", 413);
  }
  return new StorageError(message, "STORAGE_UPLOAD_FAILED", 502);
}

export async function probeStorageBucket(): Promise<
  { ok: true; bucket: string } | { ok: false; code: string; error: string }
> {
  const setupError = getStorageSetupError();
  if (setupError) {
    return { ok: false, code: "STORAGE_NOT_CONFIGURED", error: setupError };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      return {
        ok: false,
        code: "STORAGE_PROBE_FAILED",
        error: error.message,
      };
    }

    const exists = data.some((entry) => entry.name === BUCKET);
    if (!exists) {
      return {
        ok: false,
        code: "BUCKET_NOT_FOUND",
        error: `Bucket "${BUCKET}" غير موجود في Supabase Storage`,
      };
    }

    return { ok: true, bucket: BUCKET };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage probe failed";
    return { ok: false, code: "STORAGE_PROBE_FAILED", error: message };
  }
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
  const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "") || "uploads";
  const storagePath = `${safeFolder}/${year}/${filename}`;

  if (process.env.VERCEL || isStorageConfigured()) {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
      contentType,
      upsert: false,
      cacheControl: "3600",
    });

    if (error) {
      throw mapSupabaseUploadError(error.message);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return data.publicUrl;
  }

  const dir = path.join(process.cwd(), "public", safeFolder, year);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return `/${safeFolder}/${year}/${filename}`;
}

export async function deleteStoredImage(url: string): Promise<void> {
  if (!isStorageConfigured()) {
    if (url.startsWith("/uploads/") && !process.env.VERCEL) {
      const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
      await fs.unlink(filePath).catch(() => undefined);
    }
    return;
  }

  const supabase = getSupabaseAdmin();
  if (url.includes("supabase.co/storage")) {
    const marker = `/storage/v1/object/public/${BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx !== -1) {
      const storagePath = url.slice(idx + marker.length);
      await supabase.storage.from(BUCKET).remove([storagePath]);
    }
    return;
  }

  if (url.startsWith("/uploads/") && !process.env.VERCEL) {
    const filePath = path.join(process.cwd(), "public", url.replace(/^\//, ""));
    await fs.unlink(filePath).catch(() => undefined);
  }
}

export async function readImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  if (url.startsWith("/uploads/") && !process.env.VERCEL) {
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
