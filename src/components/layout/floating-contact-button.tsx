"use client";

import { useState } from "react";
import { useFloatingLinks } from "@/components/layout/floating-links-context";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Headphones, X, Sparkles, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FloatingLinkItem } from "@/lib/floating-links-defaults";
import { getFloatingColorClass, getFloatingIcon } from "@/lib/floating-link-ui";

export function FloatingContactButton() {
  const [open, setOpen] = useState(false);
  const { links } = useFloatingLinks();
  const t = useTranslations("common");
  const locale = useLocale();

  const label = (link: FloatingLinkItem) =>
    locale === "ar" ? link.labelAr : link.labelEn;

  const locationLink = links.find(
    (link) =>
      link.active &&
      link.icon === "map-pin" &&
      link.url &&
      link.url !== "#"
  );

  const menuLinks = locationLink
    ? links.filter((link) => link.id !== locationLink.id)
    : links;

  const locationLabel = locationLink ? label(locationLink) : t("openLocation");

  const renderLink = (link: FloatingLinkItem, index: number) => {
    const Icon = getFloatingIcon(link.icon);
    const colorClass = getFloatingColorClass(link.color);
    const isInternal = link.url.startsWith("/");

    const inner = (
      <div
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-white/10 bg-[#111]/95 p-2 pe-4 shadow-xl backdrop-blur-xl transition-all hover:border-brand-green/30 hover:shadow-[0_0_20px_var(--brand-glow)]",
          "hover:-translate-x-1 rtl:hover:translate-x-1"
        )}
      >
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-md transition-transform group-hover:scale-105",
            colorClass
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <span className="text-sm font-semibold text-white">{label(link)}</span>
      </div>
    );

    const motionWrap = (child: React.ReactNode) => (
      <motion.div
        key={link.id}
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 16 }}
        transition={{ delay: index * 0.04, duration: 0.2 }}
        className="group"
      >
        {child}
      </motion.div>
    );

    if (isInternal && !link.openInNewTab) {
      return motionWrap(
        <Link href={link.url} onClick={() => setOpen(false)}>
          {inner}
        </Link>
      );
    }

    return motionWrap(
      <a
        href={link.url}
        target={link.openInNewTab ? "_blank" : undefined}
        rel={link.openInNewTab ? "noopener noreferrer" : undefined}
        onClick={() => setOpen(false)}
      >
        {inner}
      </a>
    );
  };

  return (
    <div className="fixed bottom-6 end-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="mb-1 flex w-[min(280px,calc(100vw-3rem))] flex-col gap-2"
          >
            <div className="rounded-2xl border border-white/10 bg-black/80 p-3 shadow-2xl backdrop-blur-xl">
              <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
                <Sparkles className="h-4 w-4 text-brand-green" />
                <span className="text-xs font-semibold text-white/80">
                  {t("floatingContact")}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {menuLinks.map((link, i) => renderLink(link, i))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {locationLink && (
        <motion.a
          href={locationLink.url}
          target="_blank"
          rel="noopener noreferrer"
          whileTap={{ scale: 0.95 }}
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            "bg-blue-600 text-white shadow-lg ring-1 ring-white/10",
            "transition-all hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(37,99,235,0.45)]"
          )}
          aria-label={locationLabel}
          title={locationLabel}
        >
          <MapPin className="h-5 w-5" strokeWidth={2.25} />
        </motion.a>
      )}

      <motion.button
        type="button"
        onClick={() => setOpen(!open)}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative flex h-14 w-14 items-center justify-center rounded-full transition-all",
          open
            ? "bg-white/10 text-white backdrop-blur-md ring-1 ring-white/20"
            : "bg-brand-green text-black shadow-[0_0_28px_var(--brand-glow)] hover:bg-brand-green-light hover:scale-105"
        )}
        aria-label={t("floatingContact")}
        aria-expanded={open}
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-brand-green/30" />
        )}
        {open ? (
          <X className="relative h-6 w-6" />
        ) : (
          <Headphones className="relative h-6 w-6" />
        )}
      </motion.button>
    </div>
  );
}
