import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { WhyUsSection } from "@/components/home/why-us-section";
import { StatsSection } from "@/components/home/stats-section";
import { CTASection } from "@/components/home/cta-section";
import Image from "next/image";
import { buildPageMetadata } from "@/lib/seo";
import { getAboutPageContent } from "@/lib/about-content.server";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const content = await getAboutPageContent(locale);
  return buildPageMetadata({
    locale,
    path: "/about",
    title: content.title,
    description: content.description,
    images: content.heroImageUrl ? [content.heroImageUrl] : undefined,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = await getAboutPageContent(locale);
  const t = await getTranslations("about");

  const gridClass =
    content.blocks.length === 1
      ? "grid-cols-1"
      : content.blocks.length === 2
        ? "grid-cols-1 sm:grid-cols-2"
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";

  return (
    <>
      <div className="pt-20 pb-16 sm:pt-24 md:pt-32 md:pb-20">
        <div className="site-container">
          <div className="mb-12 grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:mb-20">
            <div>
              <h1 className="font-display text-page-title mb-3 font-bold sm:mb-4">
                {content.title}
              </h1>
              <p className="mb-4 text-base font-medium text-primary sm:mb-6 sm:text-lg">
                {content.subtitle}
              </p>
              <p className="text-body-lg text-muted leading-relaxed">{content.description}</p>
            </div>
            {content.heroImageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border">
                <Image
                  src={content.heroImageUrl}
                  alt={content.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized={content.heroImageUrl.includes("supabase.co")}
                />
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:mb-20">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display text-section-title mb-3 font-bold text-primary sm:mb-4">
                {content.missionTitle}
              </h2>
              <p className="text-body leading-relaxed text-muted">{content.missionText}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display text-section-title mb-3 font-bold text-primary sm:mb-4">
                {content.visionTitle}
              </h2>
              <p className="text-body leading-relaxed text-muted">{content.visionText}</p>
            </div>
          </div>

          {content.blocks.length > 0 ? (
            <div>
              <h2 className="font-display text-section-title mb-8 text-center font-bold sm:mb-10">
                {content.valuesHeading || t("values")}
              </h2>
              <div className={`grid gap-4 md:gap-6 ${gridClass}`}>
                {content.blocks.map((block) => (
                  <div
                    key={block.id}
                    className="rounded-xl border border-border bg-card p-6 text-center"
                  >
                    <h3 className="font-display mb-3 text-lg font-semibold sm:text-xl">
                      {block.title}
                    </h3>
                    <p className="text-body text-muted">{block.body}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      {content.showWhyUs ? <WhyUsSection /> : null}
      {content.showStats ? <StatsSection /> : null}
      {content.showCta ? <CTASection /> : null}
    </>
  );
}
