import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/contact/contact-form";
import { buildPageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildPageMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <div className="pt-20 pb-16 sm:pt-24 md:pt-32 md:pb-20">
      <div className="site-container">
        <div className="mb-10 text-center sm:mb-12">
          <h1 className="font-display text-page-title mb-3 font-bold sm:mb-4">
            {t("title")}
          </h1>
          <p className="text-body-lg text-muted">{t("subtitle")}</p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
