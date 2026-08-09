import "server-only";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";

export type SettingsMap = Record<string, string>;

const HERO_DEFAULTS_AR = {
  hero_eyebrow_ar: "دقة عالية • جودة مميزة • تصميم إبداعي",
  hero_title_ar: "تصميم وتنفيذ",
  hero_title_highlight_ar: "الأخشاب",
  hero_title_end_ar: "بأعلى دقة",
  hero_subtitle_ar:
    "نستخدم أحدث تقنيات CNC لتقديم منتجات خشبية استثنائية تجمع بين الدقة والجمال والمتانة",
};

const HERO_DEFAULTS_EN = {
  hero_eyebrow_en: "High Precision • Premium Quality • Creative Design",
  hero_title_en: "Design & Craft",
  hero_title_highlight_en: "Wood",
  hero_title_end_en: "With Precision",
  hero_subtitle_en:
    "We use the latest CNC technology to deliver exceptional wood products combining precision, beauty, and durability",
};

export async function getSettingsMap(): Promise<SettingsMap> {
  return getSettingsMapCached();
}

let settingsInflight: Promise<SettingsMap> | null = null;
let settingsCache: { value: SettingsMap; expiresAt: number } | null = null;

async function getSettingsMapCached(): Promise<SettingsMap> {
  const now = Date.now();
  if (settingsCache && settingsCache.expiresAt > now) {
    return settingsCache.value;
  }

  if (settingsInflight) {
    return settingsInflight;
  }

  settingsInflight = loadSettingsMap().finally(() => {
    settingsInflight = null;
  });

  return settingsInflight;
}

async function loadSettingsMap(): Promise<SettingsMap> {
  const rows = await safeDbQuery(
    () => prisma.setting.findMany(),
    [],
    "settings"
  );

  const map: SettingsMap = {};
  for (const row of rows) {
    if (row.key.endsWith("_ar")) {
      map[row.key] = row.valueAr || "";
    } else if (row.key.endsWith("_en")) {
      map[row.key] = row.valueEn || "";
    } else {
      map[row.key] = row.value || "";
    }
  }

  settingsCache = {
    value: map,
    expiresAt: Date.now() + (rows.length > 0 ? 60_000 : 10_000),
  };

  return map;
}

export function invalidateSettingsCache() {
  settingsCache = null;
  settingsInflight = null;
}

export async function getHomepageContent(locale: string) {
  const settings = await getSettingsMap();
  const isAr = locale === "ar";
  const suffix = isAr ? "_ar" : "_en";
  const defaults = isAr ? HERO_DEFAULTS_AR : HERO_DEFAULTS_EN;

  return {
    eyebrow:
      settings[`hero_eyebrow${suffix}`] ||
      defaults[`hero_eyebrow${suffix}` as keyof typeof defaults] ||
      "",
    title:
      settings[`hero_title${suffix}`] ||
      defaults[`hero_title${suffix}` as keyof typeof defaults] ||
      "",
    titleHighlight:
      settings[`hero_title_highlight${suffix}`] ||
      defaults[`hero_title_highlight${suffix}` as keyof typeof defaults] ||
      "",
    titleEnd:
      settings[`hero_title_end${suffix}`] ||
      defaults[`hero_title_end${suffix}` as keyof typeof defaults] ||
      "",
    subtitle:
      settings[`hero_subtitle${suffix}`] ||
      defaults[`hero_subtitle${suffix}` as keyof typeof defaults] ||
      "",
  };
}

export async function getContactSettings() {
  const settings = await getSettingsMap();
  return {
    phone: settings.phone || "+9647700000000",
    whatsapp: settings.whatsapp || settings.phone || "9647700000000",
    email: settings.email || "info@amcncwood.com",
    addressAr: settings.address_ar || "بغداد، العراق",
    addressEn: settings.address_en || "Baghdad, Iraq",
    mapsUrl: settings.maps_url || "",
  };
}

export async function upsertSettings(entries: SettingsMap) {
  for (const [key, rawValue] of Object.entries(entries)) {
    const value = rawValue.trim();
    const isAr = key.endsWith("_ar");
    const isEn = key.endsWith("_en");

    await prisma.setting.upsert({
      where: { key },
      update: isAr
        ? { valueAr: value }
        : isEn
          ? { valueEn: value }
          : { value },
      create: {
        key,
        value: !isAr && !isEn ? value : undefined,
        valueAr: isAr ? value : undefined,
        valueEn: isEn ? value : undefined,
        type: "text",
      },
    });
  }

  invalidateSettingsCache();
}

function digitsOnly(phone: string) {
  return phone.replace(/\D/g, "");
}

export async function syncContactFloatingLinks(contact: {
  phone: string;
  whatsapp: string;
  addressAr: string;
  addressEn: string;
  mapsUrl: string;
}) {
  const waDigits = digitsOnly(contact.whatsapp);
  const phoneDigits = digitsOnly(contact.phone);
  const mapsUrl =
    contact.mapsUrl ||
    (contact.addressAr
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.addressAr)}`
      : "");

  const templates = [
    {
      icon: "whatsapp",
      labelAr: "واتساب",
      labelEn: "WhatsApp",
      url: `https://wa.me/${waDigits}?text=${encodeURIComponent("مرحباً AM CNC WOOD DESIGN")}`,
      color: "whatsapp",
      order: 1,
    },
    {
      icon: "phone",
      labelAr: "اتصل بنا",
      labelEn: "Call Us",
      url: `tel:+${phoneDigits}`,
      color: "gold",
      order: 2,
      openInNewTab: false,
    },
    {
      icon: "map-pin",
      labelAr: "الموقع",
      labelEn: "Location",
      url: mapsUrl || "#",
      color: "blue",
      order: 3,
      active: Boolean(mapsUrl),
    },
    {
      icon: "mail",
      labelAr: "نموذج التواصل",
      labelEn: "Contact Form",
      url: "/contact",
      color: "green",
      order: 4,
      openInNewTab: false,
    },
  ];

  for (const tpl of templates) {
    const existing = await prisma.floatingLink.findFirst({
      where: { icon: tpl.icon },
    });

    const data = {
      labelAr: tpl.labelAr,
      labelEn: tpl.labelEn,
      url: tpl.url,
      icon: tpl.icon,
      color: tpl.color,
      order: tpl.order,
      active: tpl.active ?? true,
      openInNewTab: tpl.openInNewTab ?? true,
    };

    if (existing) {
      await prisma.floatingLink.update({ where: { id: existing.id }, data });
    } else {
      await prisma.floatingLink.create({ data });
    }
  }
}
