import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";
import { getProjectsAdminPaginated } from "@/lib/projects.server";
import { syncProjectImages } from "@/lib/project-images.server";
import { buildListMeta, parseAdminListQuery } from "@/lib/admin-query";

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

export async function GET(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const query = parseAdminListQuery(request.nextUrl.searchParams);
  const { items, total } = await getProjectsAdminPaginated(query);

  return NextResponse.json({
    projects: items,
    meta: buildListMeta(total, query.page, query.limit),
  });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = projectSchema.parse(await request.json());
    const { coverUrl, galleryUrls, ...data } = body;

    const project = await prisma.project.create({
      data: {
        ...data,
        categoryId: data.categoryId || null,
        images: coverUrl
          ? {
              create: {
                url: coverUrl,
                isCover: true,
                order: 0,
                altAr: data.titleAr,
                altEn: data.titleEn,
              },
            }
          : undefined,
      },
      include: {
        category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
        _count: { select: { images: true } },
      },
    });

    if (galleryUrls?.length) {
      await syncProjectImages(
        project.id,
        data.titleAr,
        data.titleEn,
        null,
        galleryUrls.filter((url) => url !== coverUrl)
      );
    }

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
