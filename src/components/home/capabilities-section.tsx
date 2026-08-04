"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Shield,
  Layers,
  Zap,
  Settings,
  Scissors,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const cards: { key: string; icon: LucideIcon }[] = [
  { key: "card1", icon: Shield },
  { key: "card2", icon: Layers },
  { key: "card3", icon: Zap },
  { key: "card4", icon: Settings },
  { key: "card5", icon: Scissors },
  { key: "card6", icon: Truck },
];

export function CapabilitiesSection() {
  const t = useTranslations("capabilities");

  return (
    <section className="section-padding section-divider bg-[#080808]">
      <div className="site-container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
        >
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-muted">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="glass-card glass-card-hover p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                <card.icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="font-semibold text-white">{t(`${card.key}Title`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t(`${card.key}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
