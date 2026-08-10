import "server-only";
import { prisma } from "@/lib/prisma";
import { invalidateImageSearchIndex } from "@/lib/image-search-index.server";
import { resolveImageHashForUrl } from "@/lib/image-hash.server";

async function upsertImageWithHash(data: {
  projectId: string;
  url: string;
  isCover: boolean;
  order: number;
  altAr: string;
  altEn: string;
  existingId?: string;
}) {
  const imageHash = await resolveImageHashForUrl(data.url);

  if (data.existingId) {
    await prisma.image.update({
      where: { id: data.existingId },
      data: {
        url: data.url,
        altAr: data.altAr,
        altEn: data.altEn,
        ...(imageHash ? { imageHash } : {}),
      },
    });
    return;
  }

  await prisma.image.create({
    data: {
      projectId: data.projectId,
      url: data.url,
      isCover: data.isCover,
      order: data.order,
      altAr: data.altAr,
      altEn: data.altEn,
      imageHash,
    },
  });
}

export async function syncProjectImages(
  projectId: string,
  titleAr: string,
  titleEn: string,
  coverUrl?: string | null,
  galleryUrls?: string[]
) {
  let indexChanged = false;

  if (coverUrl) {
    const cover = await prisma.image.findFirst({
      where: { projectId, isCover: true },
    });
    await upsertImageWithHash({
      projectId,
      url: coverUrl,
      isCover: true,
      order: 0,
      altAr: titleAr,
      altEn: titleEn,
      existingId: cover?.id,
    });
    indexChanged = true;
  }

  if (!galleryUrls) {
    if (indexChanged) invalidateImageSearchIndex();
    return;
  }

  const existing = await prisma.image.findMany({
    where: { projectId, isCover: false },
  });
  const gallerySet = new Set(galleryUrls);

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
      await upsertImageWithHash({
        projectId,
        url,
        isCover: false,
        order: order++,
        altAr: titleAr,
        altEn: titleEn,
      });
      indexChanged = true;
    }
  }

  if (indexChanged) invalidateImageSearchIndex();
}
