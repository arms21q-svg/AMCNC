import { setRequestLocale, getTranslations } from "next-intl/server";
import { WhyUsSection } from "@/components/home/why-us-section";
import { StatsSection } from "@/components/home/stats-section";
import { CTASection } from "@/components/home/cta-section";
import Image from "next/image";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return buildPageMetadata({
    locale,
    path: "/about",
    title: t("title"),
    description: t("description"),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  return (
    <>
      <div className="pt-20 pb-16 sm:pt-24 md:pt-32 md:pb-20">
        <div className="site-container">
          <div className="mb-12 grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:mb-20">
            <div>
              <h1 className="font-display text-page-title mb-3 font-bold sm:mb-4">
                {t("title")}
              </h1>
              <p className="mb-4 text-base font-medium text-primary sm:mb-6 sm:text-lg">
                {t("subtitle")}
              </p>
              <p className="text-body-lg text-muted leading-relaxed">{t("description")}</p>
            </div>
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
              <Image
                src="https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80"
                alt="AM CNC Workshop"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:mb-20">
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display text-section-title mb-3 font-bold text-primary sm:mb-4">
                {t("mission")}
              </h2>
              <p className="text-body leading-relaxed text-muted">{t("missionText")}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h2 className="font-display text-section-title mb-3 font-bold text-primary sm:mb-4">
                {t("vision")}
              </h2>
              <p className="text-body leading-relaxed text-muted">{t("visionText")}</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-section-title mb-8 text-center font-bold sm:mb-10">
              {t("values")}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
              {(["quality", "innovation", "craftsmanship"] as const).map((value) => (
                <div
                  key={value}
                  className="rounded-xl border border-border bg-card p-6 text-center"
                >
                  <h3 className="font-display mb-3 text-lg font-semibold sm:text-xl">
                    {t(value)}
                  </h3>
                  <p className="text-body text-muted">{t(`${value}Desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <WhyUsSection />
      <StatsSection />
      <CTASection />
    </>
  );
}
