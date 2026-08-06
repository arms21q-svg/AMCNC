import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { AppToaster } from "@/components/ui/app-toaster";
import { Header } from "@/components/layout/header";
import { LayoutExtras } from "@/components/layout/layout-extras";
import { SkipToContent } from "@/components/layout/skip-to-content";
import { SiteDataProvider } from "@/components/layout/site-data-context";
import { FloatingLinksProvider } from "@/components/layout/floating-links-context";
import { routing } from "@/i18n/routing";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";
import { getContactSettings } from "@/lib/site-settings.server";
import { getActiveSocialLinks } from "@/lib/social-links.server";
import {
  buildLocalBusinessJsonLd,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
  getSiteUrl,
} from "@/lib/seo";

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
    keywords: messages.metadata.keywords,
    metadataBase: new URL(getSiteUrl()),
    icons: {
      icon: BRAND_LOGO,
      apple: BRAND_LOGO,
      shortcut: BRAND_LOGO,
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
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    formatDetection: {
      telephone: true,
      email: true,
      address: true,
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
  const [messages, contact, socialLinks, tCommon] = await Promise.all([
    getMessages(),
    getContactSettings(),
    getActiveSocialLinks(),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const jsonLd = [
    buildOrganizationJsonLd(
      locale,
      socialLinks.map((link) => link.url)
    ),
    buildWebSiteJsonLd(locale),
    buildLocalBusinessJsonLd(locale),
  ];

  return (
    <>
      <SkipToContent label={tCommon("skipToContent")} />
      {jsonLd.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <SiteDataProvider contact={contact} socialLinks={socialLinks}>
        <NextIntlClientProvider messages={messages}>
          <FloatingLinksProvider>
            <Header />
            <main id="main-content" className="min-h-screen">
              {children}
            </main>
            <LayoutExtras />
            <AppToaster locale={locale} />
          </FloatingLinksProvider>
        </NextIntlClientProvider>
      </SiteDataProvider>
    </>
  );
}
