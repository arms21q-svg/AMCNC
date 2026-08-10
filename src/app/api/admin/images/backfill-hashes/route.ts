import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";
import { backfillMissingImageHashes } from "@/lib/image-hash.server";
import { invalidateImageSearchIndex } from "@/lib/image-search-index.server";

export async function POST() {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const updated = await backfillMissingImageHashes(80);
    const remaining = await prisma.image.count({
      where: {
        imageHash: null,
        project: { published: true },
      },
    });
    invalidateImageSearchIndex();
    return NextResponse.json({ success: true, updated, remaining });
  } catch (error) {
    console.error("[images/backfill-hashes]", error);
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
  }
}
