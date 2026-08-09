import sharp from "sharp";

/** Normalize uploaded/query images before hashing — faster and more consistent. */
export async function preprocessImageBuffer(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .rotate()
    .resize(512, 512, { fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toBuffer();
}

/** Compute a 64-bit difference hash (dHash) from image buffer */
export async function computeImageHash(buffer: Buffer): Promise<string> {
  const normalized = await preprocessImageBuffer(buffer);

  const { data } = await sharp(normalized)
    .resize(9, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return bitsToHashString(readGrayscaleHash(data));
}

function readGrayscaleHash(data: Buffer) {
  let hash = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const left = data[y * 9 + x];
      const right = data[y * 9 + x + 1];
      hash += left < right ? "1" : "0";
    }
  }
  return hash;
}

export function hashStringToBits(hash: string): bigint {
  let bits = BigInt(0);
  for (let i = 0; i < hash.length && i < 64; i++) {
    if (hash[i] === "1") bits |= BigInt(1) << BigInt(63 - i);
  }
  return bits;
}

export function bitsToHashString(bits: bigint | string): string {
  if (typeof bits === "string") return bits;
  let hash = "";
  for (let i = 63; i >= 0; i--) {
    hash += bits & (BigInt(1) << BigInt(i)) ? "1" : "0";
  }
  return hash;
}

/** Hamming distance between two binary hash strings */
export function hammingDistance(hash1: string, hash2: string): number {
  return popcount64(hashStringToBits(hash1) ^ hashStringToBits(hash2));
}

function popcount64(value: bigint): number {
  let count = 0;
  let v = value;
  while (v > BigInt(0)) {
    count += Number(v & BigInt(1));
    v >>= BigInt(1);
  }
  return count;
}

/** Convert hamming distance to similarity percentage (0-100) */
export function hashToSimilarity(hash1: string, hash2: string): number {
  const distance = hammingDistance(hash1, hash2);
  return similarityFromDistance(distance);
}

function similarityFromDistance(distance: number): number {
  return Math.round(((64 - distance) / 64) * 100);
}

export interface SimilarImage {
  id: string;
  url: string;
  altAr: string | null;
  altEn: string | null;
  projectId: string | null;
  project?: {
    slug: string;
    titleAr: string;
    titleEn: string;
  } | null;
  similarity: number;
}

type IndexEntry = {
  id: string;
  bits: bigint;
  url: string;
  altAr: string | null;
  altEn: string | null;
  projectId: string | null;
  project?: {
    slug: string;
    titleAr: string;
    titleEn: string;
  } | null;
};

/** Fast single-pass search against preloaded DB index. */
export function findSimilarInIndex(
  queryBits: bigint,
  entries: IndexEntry[],
  threshold = 40
): SimilarImage[] {
  const minDistance = Math.ceil(((100 - threshold) / 100) * 64);
  const fallbackMinDistance = Math.ceil(((100 - 28) / 100) * 64);

  const score = (minDist: number) => {
    const scored: SimilarImage[] = [];
    for (const entry of entries) {
      const distance = popcount64(queryBits ^ entry.bits);
      if (distance > minDist) continue;
      scored.push({
        id: entry.id,
        url: entry.url,
        altAr: entry.altAr,
        altEn: entry.altEn,
        projectId: entry.projectId,
        project: entry.project,
        similarity: similarityFromDistance(distance),
      });
    }
    scored.sort((a, b) => b.similarity - a.similarity);
    return scored;
  };

  let results = score(minDistance);
  if (results.length === 0) {
    results = score(fallbackMinDistance).slice(0, 6);
  }

  const byProject = new Map<string, SimilarImage>();
  for (const img of results) {
    const key = img.project?.slug || img.projectId || img.id;
    const existing = byProject.get(key);
    if (!existing || img.similarity > existing.similarity) {
      byProject.set(key, img);
    }
  }

  return [...byProject.values()]
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 12);
}

export function findSimilarImages(
  queryHash: string,
  images: Array<{
    id: string;
    url: string;
    altAr: string | null;
    altEn: string | null;
    imageHash: string | null;
    projectId: string | null;
    project?: {
      slug: string;
      titleAr: string;
      titleEn: string;
    } | null;
  }>,
  threshold = 40
): SimilarImage[] {
  const entries: IndexEntry[] = [];
  for (const img of images) {
    if (!img.imageHash || img.imageHash.length !== 64) continue;
    entries.push({
      id: img.id,
      bits: hashStringToBits(img.imageHash),
      url: img.url,
      altAr: img.altAr,
      altEn: img.altEn,
      projectId: img.projectId,
      project: img.project,
    });
  }

  return findSimilarInIndex(hashStringToBits(queryHash), entries, threshold);
}
