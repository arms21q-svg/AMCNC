import sharp from "sharp";

/** Compute a 64-bit difference hash (dHash) from image buffer */
export async function computeImageHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
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
  threshold = 50
): SimilarImage[] {
  return images
    .filter((img) => img.imageHash)
    .map((img) => ({
      ...img,
      similarity: hashToSimilarity(queryHash, img.imageHash!),
    }))
    .filter((img) => img.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
}
