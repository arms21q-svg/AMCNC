import { setRequestLocale, getTranslations } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CapabilitiesSection } from "@/components/home/capabilities-section";
import { MobileCategoriesSection } from "@/components/home/mobile-categories-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { CTASection } from "@/components/home/cta-section";
import { HomeFooter } from "@/components/home/home-footer";
import { getFeaturedProjects } from "@/lib/projects.server";
import { getHomepageContent } from "@/lib/site-settings.server";
import { getHeroSlides } from "@/lib/hero-slides.server";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  return buildPageMetadata({
    locale,
    path: "",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords").split(",").map((k) => k.trim()),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [projects, heroContent, heroSlides] = await Promise.all([
    getFeaturedProjects(4),
    getHomepageContent(locale),
    getHeroSlides(),
  ]);

  return (
    <div className="bg-background">
      <HeroSection content={heroContent} slides={heroSlides} />
      <FeaturesSection />
      <MobileCategoriesSection />
      <CapabilitiesSection />
      <ProjectsSection projects={projects} />
      <CTASection />
      <HomeFooter />
    </div>
  );
}
