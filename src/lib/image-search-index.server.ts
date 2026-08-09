import "server-only";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";

const INDEX_TTL_MS = 3 * 60_000;

export type SearchableImageRecord = {
  id: string;
  url: string;
  altAr: string | null;
  altEn: string | null;
  imageHash: string | null;
  projectId: string | null;
  project: {
    slug: string;
    titleAr: string;
    titleEn: string;
  } | null;
};

let indexCache: { expires: number; images: SearchableImageRecord[] } | null = null;

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

async function loadSearchableImages(): Promise<SearchableImageRecord[]> {
  return safeDbQuery(
    () =>
      prisma.image.findMany({
        where: {
          imageHash: { not: null },
          project: { published: true },
        },
        select: imageSelect,
        orderBy: { createdAt: "desc" },
      }),
    [],
    "image-search-index"
  );
}

export async function getSearchableImages(): Promise<SearchableImageRecord[]> {
  const now = Date.now();
  if (indexCache && indexCache.expires > now) {
    return indexCache.images;
  }

  const images = await loadSearchableImages();
  indexCache = { expires: now + INDEX_TTL_MS, images };
  return images;
}

export function invalidateImageSearchIndex() {
  indexCache = null;
}
