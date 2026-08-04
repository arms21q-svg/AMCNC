import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/lib/projects.server";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const pages = ["", "/portfolio", "/services", "/about", "/contact"];
const locales = ["ar", "en"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projectSlugs = await getPublishedProjectSlugs();
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of pages) {
      entries.push({
        url: `${baseUrl}/${locale}${page}`,
        lastModified: new Date(),
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
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
