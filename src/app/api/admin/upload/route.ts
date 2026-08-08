import { NextRequest, NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { saveUploadedImage, validateUploadFile } from "@/lib/images.server";
import {
  ensureStorageBucket,
  getStorageSetupError,
  StorageError,
} from "@/lib/storage.server";
import { ALLOWED_UPLOAD_FOLDERS, resolveStorageFolder } from "@/lib/storage-config";
import { mapPrismaApiError } from "@/lib/prisma-errors";

function uploadErrorResponse(error: unknown) {
  if (error instanceof StorageError) {
    console.error("[upload] storage error:", error.code, error.message);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code,
      },
      { status: error.httpStatus }
    );
  }

  const prismaMapped = mapPrismaApiError(error);
  if (prismaMapped.code !== "DB_ERROR" || prismaMapped.status !== 500) {
    console.error("[upload] db error:", prismaMapped.code, prismaMapped.error);
    return NextResponse.json(
      {
        success: false,
        error: prismaMapped.error,
        code: prismaMapped.code,
        ...(prismaMapped.hint ? { hint: prismaMapped.hint } : {}),
      },
      { status: prismaMapped.status }
    );
  }

  const message = error instanceof Error ? error.message : "Upload failed";
  const isConfig =
    /غير مضاف|غير مهيأ|Bucket|SERVICE_ROLE|SUPABASE_URL/i.test(message);

  if (isConfig) {
    return NextResponse.json(
      { success: false, error: message, code: "STORAGE_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  console.error("[upload] unexpected error:", error);
  return NextResponse.json(
    {
      success: false,
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
          success: false,
          error: storageError,
          code: "STORAGE_NOT_CONFIGURED",
          hint: "Add SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL on Vercel, then redeploy.",
        },
        { status: 503 }
      );
    }

    await ensureStorageBucket();

    const formData = await request.formData();
    const file = formData.get("file");
    const folderRaw = (formData.get("folder") as string) || "library";
    const folder = ALLOWED_UPLOAD_FOLDERS.has(folderRaw) ? folderRaw : "library";
    const storageFolder = resolveStorageFolder(folder);
    const projectId = (formData.get("projectId") as string) || undefined;
    const altAr = (formData.get("altAr") as string) || undefined;
    const altEn = (formData.get("altEn") as string) || undefined;

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No file provided", code: "NO_FILE" },
        { status: 400 }
      );
    }

    const validationError = validateUploadFile(file);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError, code: "INVALID_FILE" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const image = await saveUploadedImage(buffer, file.name, file.type, {
      folder: storageFolder,
      altAr,
      altEn,
      projectId: projectId || null,
    });

    return NextResponse.json({
      success: true,
      url: image.url,
      id: image.id,
      imageHash: image.imageHash,
    });
  } catch (error) {
    return uploadErrorResponse(error);
  }
}
