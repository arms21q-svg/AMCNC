import "server-only";
import { prisma } from "@/lib/prisma";
import { computeImageHash } from "@/lib/image-similarity";

/** Reuse hash from library row or compute from stored URL bytes. */
export async function resolveImageHashForUrl(url: string): Promise<string | null> {
  const existing = await prisma.image.findFirst({
    where: { url, imageHash: { not: null } },
    select: { imageHash: true },
  });
  if (existing?.imageHash) return existing.imageHash;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12_000) });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return await computeImageHash(buffer);
  } catch {
    return null;
  }
}

export async function backfillMissingImageHashes(limit = 50): Promise<number> {
  const rows = await prisma.image.findMany({
    where: {
      imageHash: null,
      project: { published: true },
    },
    select: { id: true, url: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  let updated = 0;
  for (const row of rows) {
    const hash = await resolveImageHashForUrl(row.url);
    if (!hash) continue;
    await prisma.image.update({
      where: { id: row.id },
      data: { imageHash: hash },
    });
    updated += 1;
  }

  return updated;
}
