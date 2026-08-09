"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProjectListItem } from "@/lib/content-types";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ProjectCard } from "@/components/portfolio/project-card";

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
            <h2 className="font-display text-section-title font-bold text-white">
              {t("subtitle")}
            </h2>
          </div>
          <Link href="/portfolio" className="btn-ghost w-full justify-center sm:w-auto">
            {t("viewAll")}
            <Arrow className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 md:hidden">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              layout="compact"
              priority={index < 4}
            />
          ))}
        </div>
        <div className="hidden gap-6 md:grid md:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              priority={index < 2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
