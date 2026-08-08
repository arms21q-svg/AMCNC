import "server-only";
import {
  ABOUT_CONTENT_SETTING_KEY,
  DEFAULT_ABOUT_CONTENT,
} from "@/lib/about-defaults";
import type { AboutContent, AboutPageView } from "@/lib/about-types";
import { getSettingsMap, invalidateSettingsCache } from "@/lib/site-settings.server";
import { prisma } from "@/lib/prisma";

function parseAboutContent(raw: string | undefined): AboutContent {
  if (!raw?.trim()) return DEFAULT_ABOUT_CONTENT;

  try {
    const parsed = JSON.parse(raw) as Partial<AboutContent>;
    return {
      ...DEFAULT_ABOUT_CONTENT,
      ...parsed,
      blocks: Array.isArray(parsed.blocks)
        ? parsed.blocks.filter(
            (block) =>
              block &&
              typeof block.id === "string" &&
              (block.titleAr?.trim() || block.titleEn?.trim())
          )
        : DEFAULT_ABOUT_CONTENT.blocks,
    };
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
}

export async function getAboutContentRaw(): Promise<AboutContent> {
  const settings = await getSettingsMap();
  return parseAboutContent(settings[ABOUT_CONTENT_SETTING_KEY]);
}

export async function getAboutPageContent(locale: string): Promise<AboutPageView> {
  const content = await getAboutContentRaw();
  const isAr = locale === "ar";

  return {
    title: isAr ? content.titleAr : content.titleEn,
    subtitle: isAr ? content.subtitleAr : content.subtitleEn,
    description: isAr ? content.descriptionAr : content.descriptionEn,
    heroImageUrl: content.heroImageUrl || DEFAULT_ABOUT_CONTENT.heroImageUrl,
    missionTitle: isAr ? content.missionTitleAr : content.missionTitleEn,
    missionText: isAr ? content.missionTextAr : content.missionTextEn,
    visionTitle: isAr ? content.visionTitleAr : content.visionTitleEn,
    visionText: isAr ? content.visionTextAr : content.visionTextEn,
    valuesHeading: isAr ? content.valuesHeadingAr : content.valuesHeadingEn,
    blocks: content.blocks.map((block) => ({
      id: block.id,
      title: isAr ? block.titleAr : block.titleEn,
      body: isAr ? block.bodyAr : block.bodyEn,
    })),
    showWhyUs: content.showWhyUs,
    showStats: content.showStats,
    showCta: content.showCta,
  };
}

export async function saveAboutContent(content: AboutContent): Promise<void> {
  const payload = JSON.stringify({
    ...content,
    blocks: content.blocks
      .filter((block) => block.titleAr.trim() || block.titleEn.trim())
      .map(({ id, titleAr, titleEn, bodyAr, bodyEn }) => ({
        id,
        titleAr,
        titleEn,
        bodyAr,
        bodyEn,
      })),
  });

  await prisma.setting.upsert({
    where: { key: ABOUT_CONTENT_SETTING_KEY },
    update: { value: payload, type: "json" },
    create: { key: ABOUT_CONTENT_SETTING_KEY, value: payload, type: "json" },
  });

  invalidateSettingsCache();
}
