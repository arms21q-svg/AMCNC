import { NextRequest, NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { saveUploadedImage, validateUploadFile } from "@/lib/images.server";
import {
  getStorageSetupError,
  probeStorageBucket,
  StorageError,
} from "@/lib/storage.server";

const ALLOWED_FOLDERS = new Set(["uploads", "projects", "hero"]);

function uploadErrorResponse(error: unknown) {
  if (error instanceof StorageError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
      },
      { status: error.httpStatus }
    );
  }

  const message = error instanceof Error ? error.message : "Upload failed";
  const isConfig =
    /غير مضاف|غير مهيأ|Bucket|SERVICE_ROLE|SUPABASE_URL/i.test(message);

  if (isConfig) {
    return NextResponse.json(
      { error: message, code: "STORAGE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  console.error("[upload]", error);
  return NextResponse.json(
    {
      error:
        process.env.NODE_ENV === "production"
          ? "فشل رفع الصورة — حاول لاحقاً"
          : message,
      code: "UPLOAD_FAILED",
    },
    { status: 500 }
  );
}

export async function POST(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const storageError = getStorageSetupError();
    if (storageError) {
      return NextResponse.json(
        {
          error: storageError,
          code: "STORAGE_NOT_CONFIGURED",
          hint: "Add SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL), and create bucket project-images on Vercel, then redeploy.",
        },
        { status: 503 }
      );
    }

    const bucketProbe = await probeStorageBucket();
    if (!bucketProbe.ok) {
      return NextResponse.json(
        {
          error: bucketProbe.error,
          code: bucketProbe.code,
          hint: 'Create a Public bucket named "project-images" in Supabase Storage (or set SUPABASE_STORAGE_BUCKET).',
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = (formData.get("folder") as string) || "uploads";
    const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "uploads";
    const projectId = (formData.get("projectId") as string) || undefined;
    const altAr = (formData.get("altAr") as string) || undefined;
    const altEn = (formData.get("altEn") as string) || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided", code: "NO_FILE" },
        { status: 400 }
      );
    }

    const validationError = validateUploadFile(file);
    if (validationError) {
      return NextResponse.json(
        { error: validationError, code: "INVALID_FILE" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await saveUploadedImage(buffer, file.name, file.type, {
      folder,
      altAr,
      altEn,
      projectId: projectId || null,
    });

    return NextResponse.json({
      id: image.id,
      url: image.url,
      imageHash: image.imageHash,
    });
  } catch (error) {
    return uploadErrorResponse(error);
  }
}
