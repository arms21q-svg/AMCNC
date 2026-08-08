import { setRequestLocale, getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/hero-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { getFeaturedProjects } from "@/lib/projects.server";
import { getHomepageContent } from "@/lib/site-settings.server";
import { getHeroSlides } from "@/lib/hero-slides.server";
import { buildPageMetadata } from "@/lib/seo";

const FeaturesSection = dynamic(
  () =>
    import("@/components/home/features-section").then((m) => ({
      default: m.FeaturesSection,
    })),
  { ssr: true }
);

const MobileCategoriesSection = dynamic(
  () =>
    import("@/components/home/mobile-categories-section").then((m) => ({
      default: m.MobileCategoriesSection,
    })),
  { ssr: true }
);

const CapabilitiesSection = dynamic(
  () =>
    import("@/components/home/capabilities-section").then((m) => ({
      default: m.CapabilitiesSection,
    })),
  { ssr: true }
);

const CTASection = dynamic(
  () =>
    import("@/components/home/cta-section").then((m) => ({
      default: m.CTASection,
    })),
  { ssr: true }
);

const HomeFooter = dynamic(
  () =>
    import("@/components/home/home-footer").then((m) => ({
      default: m.HomeFooter,
    })),
  { ssr: true }
);

export const revalidate = 3600;

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
