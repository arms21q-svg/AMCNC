import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/require-admin";
import {
  getContactSettings,
  getSettingsMap,
  syncContactFloatingLinks,
  upsertSettings,
} from "@/lib/site-settings.server";
import {
  CONTACT_SETTING_KEYS,
  HOMEPAGE_SETTING_KEYS,
} from "@/lib/admin-labels";
import { HERO_SLIDE_SETTING_KEYS } from "@/lib/hero-slides";

const settingsSchema = z.record(z.string(), z.string());

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [settings, contact] = await Promise.all([
    getSettingsMap(),
    getContactSettings(),
  ]);

  return NextResponse.json({ settings, contact });
}

export async function PUT(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { section, data, syncFloating } = body as {
      section: "homepage" | "contact";
      data: Record<string, string>;
      syncFloating?: boolean;
    };

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
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 400 });
  }
}
