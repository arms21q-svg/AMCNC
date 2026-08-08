import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import {
  getActiveCategories,
  getPublishedProjects,
} from "@/lib/projects.server";
import { buildPageMetadata } from "@/lib/seo";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });

  return buildPageMetadata({
    locale,
    path: "/portfolio",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function PortfolioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("portfolio");
  const [projects, categories] = await Promise.all([
    getPublishedProjects(),
    getActiveCategories(),
  ]);

  return (
    <div className="pt-20 pb-16 sm:pt-24 md:pt-32 md:pb-20">
      <div className="site-container">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="font-display text-page-title mb-3 font-bold sm:mb-4">
            {t("title")}
          </h1>
          <p className="text-body-lg text-muted">{t("subtitle")}</p>
        </div>
        <PortfolioGrid projects={projects} categories={categories} />
      </div>
    </div>
  );
}
