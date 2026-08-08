import "server-only";
import { prisma } from "@/lib/prisma";
import { computeImageHash } from "@/lib/image-similarity";
import { validateImageFile } from "@/lib/image-upload";
import { deleteStoredImage, uploadImageBuffer } from "@/lib/storage.server";

export interface SavedImageRow {
  id: string;
  url: string;
  altAr: string | null;
  altEn: string | null;
  order: number;
  isCover: boolean;
  imageHash: string | null;
  projectId: string | null;
  createdAt: Date;
  project?: {
    id: string;
    slug: string;
    titleAr: string;
    titleEn: string;
  } | null;
}

export async function saveUploadedImage(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  options?: {
    folder?: string;
    altAr?: string;
    altEn?: string;
    projectId?: string | null;
    isCover?: boolean;
    order?: number;
  }
): Promise<SavedImageRow> {
  let uploadedUrl: string | null = null;

  try {
    uploadedUrl = await uploadImageBuffer(
      buffer,
      originalName,
      contentType,
      options?.folder || "uploads"
    );
    const imageHash = await computeImageHash(buffer);

    return await prisma.image.create({
      data: {
        url: uploadedUrl,
        imageHash,
        altAr: options?.altAr,
        altEn: options?.altEn,
        projectId: options?.projectId ?? null,
        isCover: options?.isCover ?? false,
        order: options?.order ?? 0,
      },
      include: {
        project: {
          select: { id: true, slug: true, titleAr: true, titleEn: true },
        },
      },
    });
  } catch (error) {
    if (uploadedUrl) {
      await deleteStoredImage(uploadedUrl).catch(() => undefined);
    }
    throw error;
  }
}

export function validateUploadFile(file: File): string | null {
  return validateImageFile(file);
}

import type { AdminListQuery } from "@/lib/admin-query";

export async function listLibraryImagesPaginated(query: AdminListQuery) {
  const where = query.q
    ? {
        OR: [
          { url: { contains: query.q, mode: "insensitive" as const } },
          { altAr: { contains: query.q, mode: "insensitive" as const } },
          { altEn: { contains: query.q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.image.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: query.skip,
      take: query.limit,
      include: {
        project: {
          select: { id: true, slug: true, titleAr: true, titleEn: true },
        },
      },
    }),
    prisma.image.count({ where }),
  ]);

  return { items, total };
}

export async function listLibraryImages(): Promise<SavedImageRow[]> {
  return prisma.image.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: { id: true, slug: true, titleAr: true, titleEn: true },
      },
    },
  });
}

export async function deleteLibraryImage(id: string): Promise<void> {
  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) throw new Error("Not found");

  await prisma.image.delete({ where: { id } });
  await deleteStoredImage(image.url).catch(() => undefined);
}

export async function getImageById(id: string) {
  return prisma.image.findUnique({
    where: { id },
    include: {
      project: {
        select: { slug: true, titleAr: true, titleEn: true },
      },
    },
  });
}
