import "server-only";
import type { Locale } from "@/i18n/routing";
import ar from "../../messages/ar.json";
import en from "../../messages/en.json";

const catalogs: Record<Locale, typeof ar> = { ar, en };

/** Static message catalogs — avoids dynamic imports like messages/ads.txt.json. */
export function getMessagesForLocale(locale: Locale) {
  return catalogs[locale];
}

export function getMessagesCatalogs() {
  return catalogs;
}
