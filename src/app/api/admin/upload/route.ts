import { NextRequest, NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { saveUploadedImage, validateUploadFile } from "@/lib/images.server";
import { getStorageSetupError } from "@/lib/storage.server";

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
          hint: "Add SUPABASE_SERVICE_ROLE_KEY and SUPABASE_STORAGE_BUCKET on Vercel, then redeploy.",
        },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";
    const projectId = (formData.get("projectId") as string) || undefined;
    const altAr = (formData.get("altAr") as string) || undefined;
    const altEn = (formData.get("altEn") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const validationError = validateUploadFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
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
    console.error("[upload]", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    const status = /غير مضاف|غير مهيأ|Bucket/i.test(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
