"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLocalizedField } from "@/lib/utils";
import { BRAND_LOGO } from "@/lib/brand";
import type { ProjectListItem } from "@/lib/content-types";
import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function ProjectsSection({ projects }: { projects: ProjectListItem[] }) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  if (projects.length === 0) return null;

  return (
    <section className="section-padding section-divider">
      <div className="site-container">
        <div className="mb-10 flex flex-col gap-4 md:mb-14 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-brand-green">{t("title")}</p>
            <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
              {t("subtitle")}
            </h2>
          </div>
          <Link href="/portfolio" className="btn-ghost w-full justify-center sm:w-auto">
            {t("viewAll")}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {projects.map((project, index) => {
            const cover =
              project.images?.find((i) => i.isCover)?.url ||
              project.images?.[0]?.url ||
              BRAND_LOGO;

            return (
              <motion.div
                key={project.id}
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Link href={`/portfolio/${project.slug}`} className="group block">
                  <div className="glass-card glass-card-hover overflow-hidden">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <Image
                        src={cover}
                        alt={getLocalizedField(project, "title", locale)}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    </div>
                    <div className="p-5">
                      {project.category && (
                        <span className="text-xs font-medium text-brand-green">
                          {getLocalizedField(project.category, "name", locale)}
                        </span>
                      )}
                      <h3 className="mt-1 font-display text-lg font-semibold text-white transition-colors group-hover:text-brand-green">
                        {getLocalizedField(project, "title", locale)}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
