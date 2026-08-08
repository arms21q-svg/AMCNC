import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminOr401 } from "@/lib/require-admin";
import {
  getContactSettings,
  getSettingsMap,
  syncContactFloatingLinks,
  upsertSettings,
} from "@/lib/site-settings.server";
import { getAboutContentRaw, saveAboutContent } from "@/lib/about-content.server";
import type { AboutContent } from "@/lib/about-types";
import { mapPrismaApiError } from "@/lib/prisma-errors";
import {
  CONTACT_SETTING_KEYS,
  HOMEPAGE_SETTING_KEYS,
} from "@/lib/admin-labels";
import { HERO_SLIDE_SETTING_KEYS } from "@/lib/hero-slides";

const settingsSchema = z.record(z.string(), z.string());

const aboutContentSchema = z.object({
  titleAr: z.string(),
  titleEn: z.string(),
  subtitleAr: z.string(),
  subtitleEn: z.string(),
  descriptionAr: z.string(),
  descriptionEn: z.string(),
  heroImageUrl: z.string(),
  missionTitleAr: z.string(),
  missionTitleEn: z.string(),
  missionTextAr: z.string(),
  missionTextEn: z.string(),
  visionTitleAr: z.string(),
  visionTitleEn: z.string(),
  visionTextAr: z.string(),
  visionTextEn: z.string(),
  valuesHeadingAr: z.string(),
  valuesHeadingEn: z.string(),
  blocks: z.array(
    z.object({
      id: z.string(),
      titleAr: z.string(),
      titleEn: z.string(),
      bodyAr: z.string(),
      bodyEn: z.string(),
    })
  ),
  showWhyUs: z.boolean(),
  showStats: z.boolean(),
  showCta: z.boolean(),
});

function pickKeys(map: Record<string, string>, keys: readonly string[]) {
  const result: Record<string, string> = {};
  for (const key of keys) {
    if (map[key] !== undefined) result[key] = map[key];
  }
  return result;
}

export async function GET(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const section = request.nextUrl.searchParams.get("section");

    if (section === "homepage") {
      const settings = await getSettingsMap();
      const homepageKeys = [...HOMEPAGE_SETTING_KEYS, ...HERO_SLIDE_SETTING_KEYS];
      return NextResponse.json({ settings: pickKeys(settings, homepageKeys) });
    }

    if (section === "contact") {
      const contact = await getContactSettings();
      return NextResponse.json({ contact });
    }

    if (section === "about") {
      const content = await getAboutContentRaw();
      return NextResponse.json({ content });
    }

    const [settings, contact] = await Promise.all([
      getSettingsMap(),
      getContactSettings(),
    ]);

    return NextResponse.json({ settings, contact });
  } catch (error) {
    console.error("[admin/settings GET]", error);
    const mapped = mapPrismaApiError(error);
    return NextResponse.json(
      {
        error: mapped.error,
        code: mapped.code,
        ...(mapped.hint ? { hint: mapped.hint } : {}),
      },
      { status: mapped.status }
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = await request.json();
    const { section, data, syncFloating } = body as {
      section: "homepage" | "contact" | "about";
      data: Record<string, string> | AboutContent;
      syncFloating?: boolean;
    };

    if (section === "about") {
      const content = aboutContentSchema.parse(data);
      await saveAboutContent(content);
      return NextResponse.json({ success: true });
    }

    const parsed = settingsSchema.parse(data);

    if (section === "homepage") {
      const homepageKeys = [...HOMEPAGE_SETTING_KEYS, ...HERO_SLIDE_SETTING_KEYS];
      const filtered: Record<string, string> = {};
      for (const key of homepageKeys) {
        if (parsed[key] !== undefined) filtered[key] = parsed[key];
      }
      await upsertSettings(filtered);
    }

    if (section === "contact") {
      const filtered: Record<string, string> = {};
      for (const key of CONTACT_SETTING_KEYS) {
        if (parsed[key] !== undefined) filtered[key] = parsed[key];
      }
      await upsertSettings(filtered);

      if (syncFloating) {
        const contact = await getContactSettings();
        await syncContactFloatingLinks({
          phone: parsed.phone ?? contact.phone,
          whatsapp: parsed.whatsapp ?? contact.whatsapp,
          addressAr: parsed.address_ar ?? contact.addressAr,
          addressEn: parsed.address_en ?? contact.addressEn,
          mapsUrl: parsed.maps_url ?? contact.mapsUrl,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/settings PUT]", error);
    const mapped = mapPrismaApiError(error);
    if (mapped.code !== "DB_ERROR") {
      return NextResponse.json(
        {
          error: mapped.error,
          code: mapped.code,
          ...(mapped.hint ? { hint: mapped.hint } : {}),
        },
        { status: mapped.status }
      );
    }
    return NextResponse.json({ error: "Save failed" }, { status: 400 });
  }
}
