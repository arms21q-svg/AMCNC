import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getLocalizedField } from "@/lib/utils";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { getActiveServices } from "@/lib/services.server";
import { BRAND_LOGO } from "@/lib/brand";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return buildPageMetadata({
    locale,
    path: "/services",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const services = await getActiveServices();

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t("title")}
          </h1>
          <p className="text-muted text-lg max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        {services.length === 0 ? (
          <p className="text-center text-muted py-20">{t("subtitle")}</p>
        ) : (
          <div className="space-y-20">
            {services.map((service, index) => (
              <div
                key={service.id}
                id={service.slug}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
                    <Image
                      src={service.image || BRAND_LOGO}
                      alt={getLocalizedField(service, "title", locale)}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                    {getLocalizedField(service, "title", locale)}
                  </h2>
                  <p className="text-muted leading-relaxed mb-6">
                    {getLocalizedField(service, "description", locale)}
                  </p>
                  <Button asChild>
                    <Link href="/contact">{t("learnMore")}</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
