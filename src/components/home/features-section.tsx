"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check } from "lucide-react";

const features = ["feat1", "feat2", "feat3", "feat4"] as const;

export function FeaturesSection() {
  const t = useTranslations("features");

  return (
    <section className="section-padding section-divider relative overflow-hidden">
      <div className="site-container">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text */}
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-display text-section-title font-bold text-white md:text-4xl">
              {t("title")}
            </h2>
            <p className="text-body mt-4 leading-relaxed text-muted md:text-base">
              {t("description")}
            </p>

            <ul className="mt-8 space-y-4">
              {features.map((key, i) => (
                <motion.li
                  key={key}
                  initial={false}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-green/20 text-brand-green">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white sm:text-base">{t(`${key}Title`)}</p>
                    <p className="text-sm leading-relaxed text-muted">{t(`${key}Desc`)}</p>
                  </div>
                </motion.li>
              ))}
            </ul>

            <Link href="/portfolio" className="btn-primary mt-8 inline-flex">
              {t("cta")}
            </Link>
          </motion.div>

          {/* Decorative graphic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex aspect-square max-w-md items-center justify-center mx-auto lg:ms-auto"
          >
            <div className="absolute inset-0 grid-pattern rounded-3xl opacity-50" />
            <div className="relative h-48 w-48 rotate-45 diamond-glow rounded-3xl border border-brand-green/20 md:h-56 md:w-56">
              <div className="absolute inset-4 rounded-2xl border border-brand-green/10" />
            </div>
            <div className="glow-orb absolute inset-0 h-full w-full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
