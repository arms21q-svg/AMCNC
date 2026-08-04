"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Target, Lightbulb, Award } from "lucide-react";

const icons = [Target, Lightbulb, Award];

export function WhyUsSection() {
  const t = useTranslations("whyUs");

  const items = [
    { key: "precision", icon: icons[0] },
    { key: "experience", icon: icons[1] },
    { key: "custom", icon: icons[2] },
    { key: "quality", icon: icons[0] },
  ] as const;

  return (
    <section className="py-20 md:py-28 bg-card/30">
      <div className="container mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {t("title")}
          </h2>
          <p className="text-muted text-lg">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
            >
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary mb-5">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-3">
                {t(item.key)}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {t(`${item.key}Desc`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
