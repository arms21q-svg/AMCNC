import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/portfolio/project-detail";
import { getProjectBySlug, getPublishedProjectSlugs } from "@/lib/projects.server";
import { DEMO_FEATURED_PROJECTS } from "@/lib/demo-projects";
import { routing } from "@/i18n/routing";
import {
  buildBreadcrumbJsonLd,
  buildCreativeWorkJsonLd,
  buildPageMetadata,
} from "@/lib/seo";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  const allSlugs =
    slugs.length > 0 ? slugs : DEMO_FEATURED_PROJECTS.map((p) => p.slug);

  return routing.locales.flatMap((locale) =>
    allSlugs.map((slug) => ({ locale, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { robots: { index: false, follow: false } };

  const title = locale === "ar" ? project.titleAr : project.titleEn;
  const description =
    locale === "ar" ? project.descriptionAr : project.descriptionEn;
  const cover =
    project.images.find((img) => img.isCover)?.url || project.images[0]?.url;

  return buildPageMetadata({
    locale,
    path: `/portfolio/${slug}`,
    title,
    description,
    images: cover ? [cover] : undefined,
  });
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const t = await getTranslations({ locale, namespace: "portfolio" });
  const title = locale === "ar" ? project.titleAr : project.titleEn;
  const description =
    locale === "ar" ? project.descriptionAr : project.descriptionEn;
  const cover =
    project.images.find((img) => img.isCover)?.url || project.images[0]?.url;

  const jsonLd = [
    buildCreativeWorkJsonLd({ locale, slug, title, description, image: cover }),
    buildBreadcrumbJsonLd(locale, [
      { name: t("title"), path: "/portfolio" },
      { name: title, path: `/portfolio/${slug}` },
    ]),
  ];

  return (
    <>
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ProjectDetail project={project} />
    </>
  );
}
