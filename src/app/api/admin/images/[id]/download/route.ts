import { NextRequest, NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { getImageById } from "@/lib/images.server";
import { readImageBuffer } from "@/lib/storage.server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;
  const image = await getImageById(id);
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const { buffer, contentType } = await readImageBuffer(image.url);
    const ext = contentType.includes("png")
      ? "png"
      : contentType.includes("webp")
        ? "webp"
        : "jpg";
    const name = image.project?.slug || "image";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${name}-${id.slice(0, 8)}.${ext}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
