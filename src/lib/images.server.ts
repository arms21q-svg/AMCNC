import "server-only";
import { prisma } from "@/lib/prisma";
import { computeImageHash } from "@/lib/image-similarity";
import { deleteStoredImage, uploadImageBuffer } from "@/lib/storage.server";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/image-upload";

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
  const url = await uploadImageBuffer(
    buffer,
    originalName,
    contentType,
    options?.folder || "uploads"
  );
  const imageHash = await computeImageHash(buffer);

  return prisma.image.create({
    data: {
      url,
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
}

export function validateUploadFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return "Invalid file type";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "File too large";
  }
  return null;
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
