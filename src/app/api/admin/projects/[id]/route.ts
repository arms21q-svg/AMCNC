import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";
import { syncProjectImages } from "@/lib/project-images.server";
import { normalizeProjectInput, projectInputSchema } from "@/lib/project-schema";
import { mapPrismaApiError } from "@/lib/prisma-errors";

const projectSchema = projectInputSchema;

const patchSchema = z.object({
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

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
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

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
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  try {
    const body = projectSchema.parse(await request.json());
    const data = normalizeProjectInput(body);
    const { coverUrl, galleryUrls, ...rest } = data;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...rest,
        categoryId: rest.categoryId || null,
      },
      include: {
        category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
        _count: { select: { images: true } },
      },
    });

    await syncProjectImages(
      id,
      rest.titleAr,
      rest.titleEn,
      coverUrl,
      galleryUrls
    );

    return NextResponse.json({ project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    const mapped = mapPrismaApiError(error);
    return NextResponse.json(
      { error: mapped.error, code: mapped.code },
      { status: mapped.status }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  try {
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
