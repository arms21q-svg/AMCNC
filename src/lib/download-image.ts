"use client";

export async function downloadImageUrl(url: string, filename = "image.jpg") {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(objectUrl);
}

export function downloadAdminImage(id: string, filename?: string) {
  const link = document.createElement("a");
  link.href = `/api/admin/images/${id}/download`;
  link.download = filename || `image-${id.slice(0, 8)}.jpg`;
  link.click();
}
