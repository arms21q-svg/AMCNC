"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { HeroSlider } from "@/components/home/hero-slider";
import type { HeroSlide } from "@/lib/hero-slides";

export interface HeroContent {
  eyebrow: string;
  title: string;
  titleHighlight: string;
  titleEnd: string;
  subtitle: string;
}

export function HeroSection({
  content,
  slides,
}: {
  content?: HeroContent;
  slides: HeroSlide[];
}) {
  const t = useTranslations("hero");
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  const eyebrow = content?.eyebrow || t("eyebrow");
  const title = content?.title || t("title");
  const titleHighlight = content?.titleHighlight || t("titleHighlight");
  const titleEnd = content?.titleEnd || t("titleEnd");
  const subtitle = content?.subtitle || t("subtitle");

  return (
    <section className="relative min-h-[85vh] overflow-hidden">
      <HeroSlider locale={locale} slides={slides} />

      <div className="glow-orb -top-32 start-1/2 z-[1] h-[500px] w-[600px] -translate-x-1/2 pointer-events-none" />

      <div className="site-container relative z-10 flex min-h-[85vh] flex-col justify-center pt-24 pb-16 sm:pt-28 md:pt-32 md:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-8 flex justify-center">
            <Logo variant="full" priority className="h-20 drop-shadow-lg sm:h-24 md:h-28" />
          </div>

          <p className="mb-4 text-sm font-medium text-brand-green">{eyebrow}</p>

          <h1 className="font-display text-3xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl md:text-5xl lg:text-6xl">
            {title}{" "}
            <span className="bg-gradient-to-r from-brand-green to-brand-green-light bg-clip-text text-transparent">
              {titleHighlight}
            </span>{" "}
            {titleEnd}
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <Link href="/contact" className="btn-primary justify-center shadow-[0_0_24px_var(--brand-glow)]">
              {t("ctaContact")}
            </Link>
            <Link href="/portfolio" className="btn-ghost justify-center border-white/20 bg-black/30 backdrop-blur-sm">
              {t("ctaPortfolio")}
              <Arrow className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
