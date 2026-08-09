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

/** Hamming distance between two binary hash strings */
export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return 64;
  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

/** Convert hamming distance to similarity percentage (0-100) */
export function hashToSimilarity(hash1: string, hash2: string): number {
  const distance = hammingDistance(hash1, hash2);
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
  const scoreAll = (minSimilarity: number) =>
    images
      .filter((img) => img.imageHash)
      .map((img) => ({
        ...img,
        similarity: hashToSimilarity(queryHash, img.imageHash!),
      }))
      .filter((img) => img.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity);

  let scored = scoreAll(threshold);
  if (scored.length === 0) {
    scored = scoreAll(28).slice(0, 6);
  }

  const byProject = new Map<string, SimilarImage>();
  for (const img of scored) {
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
