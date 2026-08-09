import "server-only";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";
import { DEMO_FEATURED_PROJECTS } from "@/lib/demo-projects";
import type { ProjectListItem } from "@/lib/content-types";
import type { AdminListQuery } from "@/lib/admin-query";

export type { ProjectListItem };

const projectListInclude = {
  category: {
    select: { id: true, slug: true, nameAr: true, nameEn: true },
  },
  images: {
    select: {
      id: true,
      url: true,
      altAr: true,
      altEn: true,
      isCover: true,
      order: true,
    },
    orderBy: { order: "asc" as const },
  },
} as const;

export type ProjectDetail = NonNullable<
  Awaited<ReturnType<typeof getProjectBySlug>>
>;

export async function getPublishedProjects(): Promise<ProjectListItem[]> {
  return safeDbQuery(
    () =>
      prisma.project.findMany({
        where: { published: true },
        include: projectListInclude,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    DEMO_FEATURED_PROJECTS,
    "projects"
  );
}

export async function getFeaturedProjects(limit = 4): Promise<ProjectListItem[]> {
  return safeDbQuery(async () => {
    const featured = await prisma.project.findMany({
      where: { published: true, featured: true },
      include: projectListInclude,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    if (featured.length >= limit) return featured;

    const rest = await prisma.project.findMany({
      where: {
        published: true,
        id: { notIn: featured.map((p) => p.id) },
      },
      include: projectListInclude,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit - featured.length,
    });

    return [...featured, ...rest];
  }, DEMO_FEATURED_PROJECTS.slice(0, limit), "featured-projects");
}

export async function getProjectBySlug(slug: string) {
  return safeDbQuery(
    () =>
      prisma.project.findFirst({
        where: { slug, published: true },
        include: projectListInclude,
      }),
    null,
    "project-by-slug"
  );
}

export async function getPublishedProjectSlugs(): Promise<string[]> {
  const projects = await safeDbQuery(
    () =>
      prisma.project.findMany({
        where: { published: true },
        select: { slug: true },
        orderBy: { order: "asc" },
      }),
    [],
    "project-slugs"
  );
  return projects.map((p) => p.slug);
}

export async function getActiveCategories() {
  return safeDbQuery(
    () =>
      prisma.category.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    [],
    "categories"
  );
}

export async function getProjectsAdminPaginated(query: AdminListQuery) {
  const where = query.q
    ? {
        OR: [
          { titleAr: { contains: query.q, mode: "insensitive" as const } },
          { titleEn: { contains: query.q, mode: "insensitive" as const } },
          { descriptionAr: { contains: query.q, mode: "insensitive" as const } },
          { descriptionEn: { contains: query.q, mode: "insensitive" as const } },
          { slug: { contains: query.q, mode: "insensitive" as const } },
          { client: { contains: query.q, mode: "insensitive" as const } },
          { location: { contains: query.q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  return safeDbQuery(
    async () => {
      const [items, total] = await Promise.all([
        prisma.project.findMany({
          where,
          include: {
            category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
            _count: { select: { images: true } },
          },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          skip: query.skip,
          take: query.limit,
        }),
        prisma.project.count({ where }),
      ]);
      return { items, total };
    },
    { items: [], total: 0 },
    "admin-projects-paged"
  );
}

export async function getAllProjectsAdmin() {
  return safeDbQuery(
    () =>
      prisma.project.findMany({
        include: {
          category: { select: { id: true, slug: true, nameAr: true, nameEn: true } },
          _count: { select: { images: true } },
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
    [],
    "admin-projects"
  );
}
