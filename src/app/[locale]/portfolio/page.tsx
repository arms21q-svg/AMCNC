import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { PortfolioGrid } from "@/components/portfolio/portfolio-grid";
import {
  getActiveCategories,
  getPublishedProjects,
} from "@/lib/projects.server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "portfolio" });

  return {
    title: t("title"),
    description: t("subtitle"),
  };
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
    <div className="pt-24 md:pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted text-lg">{t("subtitle")}</p>
        </div>
        <PortfolioGrid projects={projects} categories={categories} />
      </div>
    </div>
  );
}
