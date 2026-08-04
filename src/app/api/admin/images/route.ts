import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { listLibraryImages } from "@/lib/images.server";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const images = await listLibraryImages();
  return NextResponse.json({ images });
}
