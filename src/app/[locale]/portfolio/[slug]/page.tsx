import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/portfolio/project-detail";
import { getProjectBySlug } from "@/lib/projects.server";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  const title = locale === "ar" ? project.titleAr : project.titleEn;
  const description =
    locale === "ar" ? project.descriptionAr : project.descriptionEn;
  const cover =
    project.images.find((img) => img.isCover)?.url || project.images[0]?.url;

  return {
    title,
    description,
    openGraph: { title, description, images: cover ? [cover] : [] },
  };
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

  return <ProjectDetail project={project} />;
}
