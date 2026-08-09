import "server-only";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { hashStringToBits, findSimilarInIndex, type SimilarImage } from "@/lib/image-similarity";

const INDEX_TTL_MS = 10 * 60_000;

export type SearchIndexEntry = {
  id: string;
  bits: bigint;
  url: string;
  altAr: string | null;
  altEn: string | null;
  projectId: string | null;
  project: {
    slug: string;
    titleAr: string;
    titleEn: string;
  } | null;
};

let indexCache: { expires: number; entries: SearchIndexEntry[] } | null = null;
let indexInflight: Promise<SearchIndexEntry[]> | null = null;

const imageSelect = {
  id: true,
  url: true,
  altAr: true,
  altEn: true,
  imageHash: true,
  projectId: true,
  project: {
    select: { slug: true, titleAr: true, titleEn: true },
  },
} as const;

async function loadSearchIndexEntries(): Promise<SearchIndexEntry[]> {
  const rows = await safeDbQuery(
    () =>
      prisma.image.findMany({
        where: {
          imageHash: { not: null },
          project: { published: true },
        },
        select: imageSelect,
      }),
    [],
    "image-search-index"
  );

  const entries: SearchIndexEntry[] = [];
  for (const row of rows) {
    if (!row.imageHash || row.imageHash.length !== 64) continue;
    entries.push({
      id: row.id,
      bits: hashStringToBits(row.imageHash),
      url: row.url,
      altAr: row.altAr,
      altEn: row.altEn,
      projectId: row.projectId,
      project: row.project,
    });
  }

  return entries;
}

export async function getSearchIndex(): Promise<SearchIndexEntry[]> {
  const now = Date.now();
  if (indexCache && indexCache.expires > now) {
    return indexCache.entries;
  }

  if (indexInflight) return indexInflight;

  indexInflight = loadSearchIndexEntries()
    .then((entries) => {
      indexCache = { expires: Date.now() + INDEX_TTL_MS, entries };
      return entries;
    })
    .finally(() => {
      indexInflight = null;
    });

  return indexInflight;
}

/** Preload index during page render to avoid cold search latency. */
export function warmImageSearchIndex() {
  void getSearchIndex();
}

export function invalidateImageSearchIndex() {
  indexCache = null;
  indexInflight = null;
}

export async function searchImagesByHash(
  queryHash: string,
  threshold = 40
): Promise<SimilarImage[]> {
  const entries = await getSearchIndex();
  if (entries.length === 0) return [];

  const queryBits = hashStringToBits(queryHash);
  return findSimilarInIndex(queryBits, entries, threshold);
}

/** @deprecated use getSearchIndex */
export async function getSearchableImages() {
  return getSearchIndex();
}
