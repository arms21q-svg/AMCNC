import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeImageHash } from "@/lib/image-similarity";
import { searchImagesByHash } from "@/lib/image-search-index.server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { mapPrismaApiError } from "@/lib/prisma-errors";
import type { SimilarImage } from "@/lib/image-similarity";

const CACHE_TTL_MS = 10 * 60_000;
const searchCache = new Map<string, { expires: number; results: SimilarImage[] }>();

const hashSchema = z.string().regex(/^[01]{64}$/);

function getCachedResults(hash: string) {
  const entry = searchCache.get(hash);
  if (!entry || entry.expires < Date.now()) {
    searchCache.delete(hash);
    return null;
  }
  return entry.results;
}

function setCachedResults(hash: string, results: SimilarImage[]) {
  if (searchCache.size > 300) {
    const oldest = searchCache.keys().next().value;
    if (oldest) searchCache.delete(oldest);
  }
  searchCache.set(hash, { expires: Date.now() + CACHE_TTL_MS, results });
}

function jsonResponse(
  body: Record<string, unknown>,
  init?: { status?: number; cached?: boolean }
) {
  const response = NextResponse.json(body, { status: init?.status ?? 200 });
  if (init?.cached) {
    response.headers.set("Cache-Control", "private, max-age=300, stale-while-revalidate=600");
  }
  return response;
}

async function runSearch(queryHash: string) {
  const cached = getCachedResults(queryHash);
  if (cached) {
    return { results: cached, queryHash, cached: true, source: "database" as const };
  }

  const results = await searchImagesByHash(queryHash, 40);
  setCachedResults(queryHash, results);

  return { results, queryHash, cached: false, source: "database" as const };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`image-search:${ip}`, 30, 60_000);

  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const parsed = hashSchema.safeParse(body.hash);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid hash" }, { status: 400 });
      }

      const payload = await runSearch(parsed.data);
      return jsonResponse(payload, { cached: payload.cached });
    }

    const formData = await request.formData();
    const hashField = formData.get("hash");
    if (typeof hashField === "string" && hashSchema.safeParse(hashField).success) {
      const payload = await runSearch(hashField);
      return jsonResponse(payload, { cached: payload.cached });
    }

    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No image or hash provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const queryHash = await computeImageHash(buffer);
    const payload = await runSearch(queryHash);
    return jsonResponse(payload, { cached: payload.cached });
  } catch (error) {
    console.error("[search/image]", error);
    const mapped = mapPrismaApiError(error);
    return NextResponse.json(
      { error: mapped.error, code: mapped.code },
      { status: mapped.status }
    );
  }
}
