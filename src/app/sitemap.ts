import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/lib/projects.server";
import { getSiteUrl } from "@/lib/seo";

const baseUrl = getSiteUrl();

const pages = ["", "/portfolio", "/services", "/about", "/contact"];
const locales = ["ar", "en"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectSlugs = await getPublishedProjectSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        changeFrequency: page === "" ? "weekly" : "monthly",
        priority: page === "" ? 1 : 0.8,
        alternates: {
          languages: {
            ar: `${baseUrl}/ar${page}`,
            en: `${baseUrl}/en${page}`,
          },
        },
      });
    }

    for (const slug of projectSlugs) {
      entries.push({
        url: `${baseUrl}/${locale}/portfolio/${slug}`,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: {
          languages: {
            ar: `${baseUrl}/ar/portfolio/${slug}`,
            en: `${baseUrl}/en/portfolio/${slug}`,
          },
        },
      });
    }
  }

  return entries;
}
