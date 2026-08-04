"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="glow-orb start-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2" />
      <div className="site-container relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card mx-auto max-w-2xl p-10 text-center md:p-14"
        >
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted">{t("subtitle")}</p>
          <Link href="/contact" className="btn-primary mt-8 inline-flex">
            {t("button")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
