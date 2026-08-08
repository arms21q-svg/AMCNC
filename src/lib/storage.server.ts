import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import {
  resolveStorageFolder,
  STORAGE_BUCKET,
} from "@/lib/storage-config";

let supabaseAdmin: SupabaseClient | null = null;
let bucketReadyPromise: Promise<void> | null = null;

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
  return (
    process.env.SUPABASE_STORAGE_BUCKET?.trim() || STORAGE_BUCKET
  );
}

function getBucket(): string {
  const configured = getStorageBucketName();
  if (configured !== STORAGE_BUCKET) {
    console.warn(
      `[storage] SUPABASE_STORAGE_BUCKET="${configured}" — unified bucket is "${STORAGE_BUCKET}"`
    );
  }
  return STORAGE_BUCKET;
}

export function mustUseRemoteStorage(): boolean {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
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

function mapSupabaseUploadError(message: string, bucket: string): StorageError {
  if (/bucket not found/i.test(message)) {
    return new StorageError(
      `Storage bucket ${bucket} غير موجود.`,
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

  const bucket = getBucket();

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

    const exists = data.some((entry) => entry.name === bucket);
    if (!exists) {
      return {
        ok: false,
        code: "BUCKET_NOT_FOUND",
        error: `Storage bucket ${bucket} غير موجود.`,
      };
    }

    return { ok: true, bucket };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Storage probe failed";
    return { ok: false, code: "STORAGE_PROBE_FAILED", error: message };
  }
}

/** Create the unified bucket if missing (requires service role). */
export async function ensureStorageBucket(): Promise<string> {
  if (bucketReadyPromise) {
    await bucketReadyPromise;
    return getBucket();
  }

  bucketReadyPromise = (async () => {
    const bucket = getBucket();
    const probe = await probeStorageBucket();
    if (probe.ok) return;

    if (probe.code !== "BUCKET_NOT_FOUND") {
      throw new StorageError(probe.error, probe.code, 503);
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.storage.createBucket(bucket, {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ],
    });

    if (error && !/already exists/i.test(error.message)) {
      console.error("[storage] createBucket failed:", error.message);
      throw mapSupabaseUploadError(error.message, bucket);
    }
  })();

  try {
    await bucketReadyPromise;
  } catch (error) {
    bucketReadyPromise = null;
    throw error;
  }

  return getBucket();
}

export async function uploadImageBuffer(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  folder = "library"
): Promise<string> {
  if (mustUseRemoteStorage() && !isStorageConfigured()) {
    throw new StorageError(
      getStorageSetupError() || "Supabase Storage غير مهيأ",
      "STORAGE_NOT_CONFIGURED",
      503
    );
  }

  if (!isStorageConfigured()) {
    throw new StorageError(
      "الرفع يتطلب Supabase Storage — أضف SUPABASE_SERVICE_ROLE_KEY",
      "STORAGE_NOT_CONFIGURED",
      503
    );
  }

  const bucket = await ensureStorageBucket();
  const ext = extensionFromName(originalName, contentType);
  const filename = `${randomUUID()}.${ext}`;
  const year = new Date().getFullYear().toString();
  const safeFolder = resolveStorageFolder(folder);
  const storagePath = `${safeFolder}/${year}/${filename}`;

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(bucket).upload(storagePath, buffer, {
    contentType,
    upsert: false,
    cacheControl: "3600",
  });

  if (error) {
    console.error("[storage] upload failed:", error.message, { bucket, storagePath });
    throw mapSupabaseUploadError(error.message, bucket);
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteStoredImage(url: string): Promise<void> {
  if (!isStorageConfigured() || !url.includes("supabase.co/storage")) {
    return;
  }

  const bucket = getBucket();
  const supabase = getSupabaseAdmin();
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx !== -1) {
    const storagePath = url.slice(idx + marker.length);
    await supabase.storage.from(bucket).remove([storagePath]);
  }
}

export async function readImageBuffer(url: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch image");
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  return { buffer, contentType };
}
