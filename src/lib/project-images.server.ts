import "server-only";
import { prisma } from "@/lib/prisma";
import { invalidateImageSearchIndex } from "@/lib/image-search-index.server";

export async function syncProjectImages(
  projectId: string,
  titleAr: string,
  titleEn: string,
  coverUrl?: string | null,
  galleryUrls?: string[]
) {
  if (coverUrl) {
    const cover = await prisma.image.findFirst({
      where: { projectId, isCover: true },
    });
    if (cover) {
      await prisma.image.update({
        where: { id: cover.id },
        data: { url: coverUrl, altAr: titleAr, altEn: titleEn },
      });
    } else {
      await prisma.image.create({
        data: {
          projectId,
          url: coverUrl,
          isCover: true,
          order: 0,
          altAr: titleAr,
          altEn: titleEn,
        },
      });
    }
  }

  if (!galleryUrls) return;

  const existing = await prisma.image.findMany({
    where: { projectId, isCover: false },
  });
  const gallerySet = new Set(galleryUrls);
  let indexChanged = false;

  for (const img of existing) {
    if (!gallerySet.has(img.url)) {
      await prisma.image.delete({ where: { id: img.id } });
      indexChanged = true;
    }
  }

  const existingUrls = new Set(existing.map((img) => img.url));
  let order = 1;
  for (const url of galleryUrls) {
    if (url && !existingUrls.has(url)) {
      await prisma.image.create({
        data: {
          projectId,
          url,
          isCover: false,
          order: order++,
          altAr: titleAr,
          altEn: titleEn,
        },
      });
      indexChanged = true;
    }
  }

  if (indexChanged) invalidateImageSearchIndex();
}
