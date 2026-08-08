"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
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
    <section className="relative min-h-[80svh] overflow-hidden sm:min-h-[85vh]">
      <HeroSlider locale={locale} slides={slides} />

      <div className="glow-orb pointer-events-none -top-32 start-1/2 z-[1] h-[min(500px,80vw)] w-[min(600px,95vw)] -translate-x-1/2" />

      <div className="site-container relative z-10 flex min-h-[80svh] flex-col justify-center pt-20 pb-14 sm:min-h-[85vh] sm:pt-28 sm:pb-16 md:pt-32 md:pb-20">
        <motion.div
          initial={false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mb-6 flex justify-center sm:mb-8">
            <Logo variant="full" priority className="h-[clamp(4.5rem,18vw,7rem)] drop-shadow-lg" />
          </div>

          <p className="mb-3 text-sm font-medium text-brand-green sm:mb-4">{eyebrow}</p>

          <h1 className="font-display text-display font-bold text-white drop-shadow-sm">
            {title}{" "}
            <span className="bg-gradient-to-r from-brand-green to-brand-green-light bg-clip-text text-transparent">
              {titleHighlight}
            </span>{" "}
            {titleEnd}
          </h1>

          <p className="text-body-lg mx-auto mt-5 max-w-xl text-white/85 sm:mt-6">
            {subtitle}
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-4">
            <WhatsAppLink className="btn-primary justify-center shadow-[0_0_24px_var(--brand-glow)]">
              {t("ctaContact")}
            </WhatsAppLink>
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
