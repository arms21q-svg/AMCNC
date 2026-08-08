"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";

export function CTASection() {
  const t = useTranslations("cta");

  return (
    <section className="section-padding relative overflow-hidden">
      <div className="glow-orb start-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2" />
      <div className="site-container relative">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card mx-auto max-w-2xl p-8 text-center sm:p-10 md:p-14"
        >
          <h2 className="font-display text-section-title font-bold text-white">
            {t("title")}
          </h2>
          <p className="text-body mt-4 text-muted">{t("subtitle")}</p>
          <WhatsAppLink className="btn-primary mt-8 inline-flex">
            {t("button")}
          </WhatsAppLink>
        </motion.div>
      </div>
    </section>
  );
}
