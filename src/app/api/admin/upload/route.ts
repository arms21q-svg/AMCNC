import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { saveUploadedImage, validateUploadFile } from "@/lib/images.server";

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
