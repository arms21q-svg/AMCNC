"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLocale = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <>
      {/* Mobile: icon only */}
      <button
        type="button"
        onClick={toggleLocale}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground/80 transition-colors hover:border-brand-green hover:text-brand-green md:hidden"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
      </button>
      {/* Desktop: icon + label */}
      <button
        type="button"
        onClick={toggleLocale}
        className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/85 transition-colors hover:text-brand-green md:flex"
        aria-label="Switch language"
      >
        <Globe className="h-4 w-4" />
        <span>{locale === "ar" ? "العربية" : "English"}</span>
      </button>
    </>
  );
}
