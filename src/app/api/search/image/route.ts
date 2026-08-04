import { NextRequest, NextResponse } from "next/server";
import { computeImageHash, findSimilarImages } from "@/lib/image-similarity";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`image-search:${ip}`, 20, 60_000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const queryHash = await computeImageHash(buffer);

    const images = await prisma.image.findMany({
      where: { imageHash: { not: null } },
      include: {
        project: {
          select: { slug: true, titleAr: true, titleEn: true },
        },
      },
    });

    const results = findSimilarImages(queryHash, images, 40);

    return NextResponse.json({ results, queryHash });
  } catch (error) {
    console.error("Image search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
