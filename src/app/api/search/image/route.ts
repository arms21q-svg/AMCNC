import { NextRequest, NextResponse } from "next/server";
import { computeImageHash, findSimilarImages } from "@/lib/image-similarity";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { mapPrismaApiError } from "@/lib/prisma-errors";

const CACHE_TTL_MS = 5 * 60_000;
const searchCache = new Map<string, { expires: number; results: ReturnType<typeof findSimilarImages> }>();

function getCachedResults(hash: string) {
  const entry = searchCache.get(hash);
  if (!entry || entry.expires < Date.now()) {
    searchCache.delete(hash);
    return null;
  }
  return entry.results;
}

function setCachedResults(hash: string, results: ReturnType<typeof findSimilarImages>) {
  if (searchCache.size > 200) {
    const oldest = searchCache.keys().next().value;
    if (oldest) searchCache.delete(oldest);
  }
  searchCache.set(hash, { expires: Date.now() + CACHE_TTL_MS, results });
}

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

    const cached = getCachedResults(queryHash);
    if (cached) {
      return NextResponse.json({ results: cached, queryHash, cached: true });
    }

    const images = await prisma.image.findMany({
      where: {
        imageHash: { not: null },
        project: { published: true },
      },
      select: {
        id: true,
        url: true,
        altAr: true,
        altEn: true,
        imageHash: true,
        projectId: true,
        project: {
          select: { slug: true, titleAr: true, titleEn: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 400,
    });

    const results = findSimilarImages(queryHash, images, 40);
    setCachedResults(queryHash, results);

    return NextResponse.json({ results, queryHash, cached: false });
  } catch (error) {
    console.error("[search/image]", error);
    const mapped = mapPrismaApiError(error);
    return NextResponse.json(
      { error: mapped.error, code: mapped.code },
      { status: mapped.status }
    );
  }
}
