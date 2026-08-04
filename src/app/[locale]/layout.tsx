import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { AppToaster } from "@/components/ui/app-toaster";
import { Header } from "@/components/layout/header";
import { LayoutExtras } from "@/components/layout/layout-extras";
import { SetLocaleAttributes } from "@/components/layout/set-locale-attributes";
import { routing } from "@/i18n/routing";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return {
    title: {
      default: messages.metadata.title,
      template: `%s | ${BRAND_NAME}`,
    },
    description: messages.metadata.description,
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    icons: {
      icon: BRAND_LOGO,
      apple: BRAND_LOGO,
      shortcut: BRAND_LOGO,
    },
    alternates: {
      canonical: "/",
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_SA" : "en_US",
      siteName: BRAND_NAME,
      title: messages.metadata.title,
      description: messages.metadata.description,
      images: [{ url: BRAND_LOGO, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: messages.metadata.title,
      description: messages.metadata.description,
      images: [BRAND_LOGO],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: siteUrl,
    logo: `${siteUrl}${BRAND_LOGO}`,
    description:
      locale === "ar"
        ? "شركة متخصصة في تصميم ونحت الخشب بتقنية CNC"
        : "Specialized in CNC wood design and carving",
  };

  return (
    <>
      <SetLocaleAttributes locale={locale} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NextIntlClientProvider messages={messages}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <LayoutExtras />
        <AppToaster locale={locale} />
      </NextIntlClientProvider>
    </>
  );
}
