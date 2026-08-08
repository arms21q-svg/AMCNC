import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";
import { getProjectsAdminPaginated } from "@/lib/projects.server";
import { syncProjectImages } from "@/lib/project-images.server";
import { buildListMeta, parseAdminListQuery } from "@/lib/admin-query";
import { normalizeProjectInput, projectInputSchema } from "@/lib/project-schema";
import { mapPrismaApiError } from "@/lib/prisma-errors";

const projectSchema = projectInputSchema;

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
    const data = normalizeProjectInput(body);
    const { coverUrl, galleryUrls, ...rest } = data;

    const project = await prisma.project.create({
      data: {
        ...rest,
        categoryId: rest.categoryId || null,
        images: coverUrl
          ? {
              create: {
                url: coverUrl,
                isCover: true,
                order: 0,
                altAr: rest.titleAr,
                altEn: rest.titleEn,
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
        rest.titleAr,
        rest.titleEn,
        null,
        galleryUrls.filter((url) => url !== coverUrl)
      );
    }

    return NextResponse.json({ project }, { status: 201 });
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
