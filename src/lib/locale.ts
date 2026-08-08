import type { Locale } from "@/i18n/routing";
import { notFound } from "next/navigation";

export function isAppLocale(locale: string): locale is Locale {
  return locale === "ar" || locale === "en";
}

export function resolveAppLocale(locale: string): Locale {
  return isAppLocale(locale) ? locale : "ar";
}

/** Stop invalid [locale] segments (e.g. ads.txt) before loading translations. */
export function assertAppLocale(locale: string): Locale {
  if (!isAppLocale(locale)) {
    notFound();
  }
  return locale;
}
