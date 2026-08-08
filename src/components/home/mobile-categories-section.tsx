"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MessageCircle } from "lucide-react";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";

const categories = [
  {
    key: "card1",
    image:
      "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80&fit=crop",
    href: "/portfolio",
  },
  {
    key: "card2",
    image:
      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80&fit=crop",
    href: "/portfolio",
  },
  {
    key: "card3",
    image:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80&fit=crop",
    href: "/portfolio",
  },
  {
    key: "card4",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop",
    href: "/portfolio",
  },
  {
    key: "card5",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80&fit=crop",
    href: "/portfolio",
  },
  {
    key: "card6",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80&fit=crop",
    href: "/portfolio",
  },
] as const;

export function MobileCategoriesSection() {
  const t = useTranslations("capabilities");
  const tHero = useTranslations("hero");

  return (
    <section className="section-padding section-divider bg-background md:hidden">
      <div className="site-container">
        <div className="mb-6 text-center">
          <h2 className="font-display text-section-title font-bold text-white">{t("title")}</h2>
          <p className="text-body mt-2 text-muted">{t("subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[400px]:grid-cols-2">
          {categories.map((item, index) => (
            <motion.div
              key={item.key}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={item.href}
                className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-brand-green/40"
              >
                <div className="relative aspect-[4/3] bg-[#0a0a0a] p-3 min-[400px]:aspect-square">
                  <Image
                    src={item.image}
                    alt={t(`${item.key}Title`)}
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 400px) 100vw, 45vw"
                  />
                </div>
                <p className="px-3 py-3.5 text-center text-sm font-semibold leading-snug text-white min-[400px]:px-2">
                  {t(`${item.key}Title`)}
                </p>
              </Link>
            </motion.div>
          ))}

          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="min-[400px]:col-span-2"
          >
            <WhatsAppLink className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-brand-green px-4 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_var(--brand-glow)] transition-all hover:bg-brand-green-light active:scale-[0.98]">
              <MessageCircle className="h-5 w-5" />
              {tHero("ctaContact")}
            </WhatsAppLink>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
