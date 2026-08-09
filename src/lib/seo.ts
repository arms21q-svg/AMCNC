import type { Metadata } from "next";
import { BRAND_LOGO, BRAND_NAME } from "@/lib/brand";

function readProductionHost(): string | undefined {
  const production =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) {
    return production.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }
  return undefined;
}

export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured && !configured.includes("localhost")) {
    return configured.replace(/\/$/, "");
  }

  const productionHost = readProductionHost();
  if (productionHost) {
    return `https://${productionHost}`;
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export function buildAlternates(locale: string, path = "") {
  const pagePath = path && path !== "/" ? path : "";

  return {
    canonical: `/${locale}${pagePath}`,
    languages: {
      ar: `/ar${pagePath}`,
      en: `/en${pagePath}`,
    },
  };
}

export function buildPageMetadata({
  locale,
  path = "",
  title,
  description,
  images,
  keywords,
}: {
  locale: string;
  path?: string;
  title: string;
  description: string;
  images?: string[];
  keywords?: string[];
}): Metadata {
  const ogImages = (images?.length ? images : [BRAND_LOGO]).map((url) => ({
    url,
    alt: title,
  }));

  return {
    metadataBase: new URL(getSiteUrl()),
    title,
    description,
    keywords,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type: "website",
      locale: locale === "ar" ? "ar_IQ" : "en_US",
      siteName: BRAND_NAME,
      title,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export function buildOrganizationJsonLd(locale: string, sameAs: string[] = []) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: BRAND_NAME,
    url: siteUrl,
    logo: `${siteUrl}${BRAND_LOGO}`,
    description:
      locale === "ar"
        ? "شركة متخصصة في تصميم ونحت الخشب بتقنية CNC"
        : "Specialized in CNC wood design and carving",
    sameAs,
  };
}

export function buildWebSiteJsonLd(locale: string) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BRAND_NAME,
    url: `${siteUrl}/${locale}`,
    inLanguage: locale === "ar" ? "ar-IQ" : "en-US",
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      logo: `${siteUrl}${BRAND_LOGO}`,
    },
  };
}

export function buildLocalBusinessJsonLd(locale: string) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BRAND_NAME,
    url: siteUrl,
    image: `${siteUrl}${BRAND_LOGO}`,
    description:
      locale === "ar"
        ? "تصميم ونحت خشبي فاخر بتقنية CNC"
        : "Luxury CNC wood design and carving",
    telephone: process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+9647700000000",
    address: {
      "@type": "PostalAddress",
      addressLocality: locale === "ar" ? "بغداد" : "Baghdad",
      addressCountry: locale === "ar" ? "العراق" : "IQ",
    },
    priceRange: "$$",
  };
}

export function buildCreativeWorkJsonLd({
  locale,
  slug,
  title,
  description,
  image,
}: {
  locale: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
}) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: title,
    description,
    url: `${siteUrl}/${locale}/portfolio/${slug}`,
    image,
    creator: {
      "@type": "Organization",
      name: BRAND_NAME,
    },
  };
}

export function buildBreadcrumbJsonLd(
  locale: string,
  items: { name: string; path: string }[]
) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}/${locale}${item.path}`,
    })),
  };
}
