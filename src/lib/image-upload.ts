export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "نوع الملف غير مدعوم. استخدم JPG أو PNG أو WebP أو GIF";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "حجم الملف أكبر من 10 ميجابايت";
  }
  return null;
}
