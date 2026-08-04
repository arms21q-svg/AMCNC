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
      <div className="pt-24 md:pt-32 pb-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {t("title")}
              </h1>
              <p className="text-primary font-medium mb-6">{t("subtitle")}</p>
              <p className="text-muted leading-relaxed text-lg">
                {t("description")}
              </p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            <div className="p-8 rounded-xl border border-border bg-card">
              <h2 className="font-display text-2xl font-bold mb-4 text-primary">
                {t("mission")}
              </h2>
              <p className="text-muted leading-relaxed">{t("missionText")}</p>
            </div>
            <div className="p-8 rounded-xl border border-border bg-card">
              <h2 className="font-display text-2xl font-bold mb-4 text-primary">
                {t("vision")}
              </h2>
              <p className="text-muted leading-relaxed">{t("visionText")}</p>
            </div>
          </div>

          <div>
            <h2 className="font-display text-3xl font-bold text-center mb-10">
              {t("values")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(["quality", "innovation", "craftsmanship"] as const).map((value) => (
                <div
                  key={value}
                  className="text-center p-6 rounded-xl border border-border bg-card"
                >
                  <h3 className="font-display text-lg font-semibold mb-3">
                    {t(value)}
                  </h3>
                  <p className="text-sm text-muted">{t(`${value}Desc`)}</p>
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
