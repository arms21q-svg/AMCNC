import { setRequestLocale } from "next-intl/server";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturesSection } from "@/components/home/features-section";
import { CapabilitiesSection } from "@/components/home/capabilities-section";
import { ProjectsSection } from "@/components/home/projects-section";
import { CTASection } from "@/components/home/cta-section";
import { HomeFooter } from "@/components/home/home-footer";
import { getFeaturedProjects } from "@/lib/projects.server";
import { getHomepageContent } from "@/lib/site-settings.server";
import { getHeroSlides } from "@/lib/hero-slides.server";

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
      <CapabilitiesSection />
      <ProjectsSection projects={projects} />
      <CTASection />
      <HomeFooter />
    </div>
  );
}
