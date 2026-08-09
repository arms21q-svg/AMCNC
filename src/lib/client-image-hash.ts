/** Client-side dHash — mirrors server algorithm for fast DB-only search. */
export async function computeClientImageHash(source: File | Blob): Promise<string> {
  const bitmap = await createImageBitmap(source);
  const maxEdge = 512;
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const normalized = document.createElement("canvas");
  normalized.width = width;
  normalized.height = height;
  const nctx = normalized.getContext("2d", { willReadFrequently: true });
  if (!nctx) {
    bitmap.close();
    throw new Error("Canvas unavailable");
  }
  nctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const sample = document.createElement("canvas");
  sample.width = 9;
  sample.height = 8;
  const sctx = sample.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("Canvas unavailable");

  sctx.drawImage(normalized, 0, 0, 9, 8);
  const { data } = sctx.getImageData(0, 0, 9, 8);

  let hash = "";
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const li = (y * 9 + x) * 4;
      const ri = (y * 9 + x + 1) * 4;
      const left = luminance(data[li], data[li + 1], data[li + 2]);
      const right = luminance(data[ri], data[ri + 1], data[ri + 2]);
      hash += left < right ? "1" : "0";
    }
  }

  return hash;
}

function luminance(r: number, g: number, b: number) {
  return r * 0.299 + g * 0.587 + b * 0.114;
}
