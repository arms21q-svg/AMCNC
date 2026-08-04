import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { syncProjectImages } from "@/lib/project-images.server";

const projectSchema = z.object({
  slug: z.string().min(1).max(120),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  client: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  year: z.number().int().optional().nullable(),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
  categoryId: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  galleryUrls: z.array(z.string()).optional(),
});

const patchSchema = z.object({
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
      images: { orderBy: { order: "asc" } },
      _count: { select: { images: true } },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = patchSchema.parse(await request.json());
    const project = await prisma.project.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ project });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = projectSchema.parse(await request.json());
    const { coverUrl, galleryUrls, ...data } = body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        categoryId: data.categoryId || null,
      },
      include: {
        category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
        _count: { select: { images: true } },
      },
    });

    await syncProjectImages(
      id,
      data.titleAr,
      data.titleEn,
      coverUrl,
      galleryUrls
    );

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
