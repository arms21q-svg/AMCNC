import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ar", "en"],
  defaultLocale: "ar",
  localePrefix: "always",
  // Always open in Arabic; user can switch to English via the header toggle.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
