"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedField } from "@/lib/utils";
import { BRAND_LOGO } from "@/lib/brand";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Share2, X, ChevronLeft, ChevronRight, ArrowLeft, ArrowRight, Download } from "lucide-react";

import type { ProjectListItem } from "@/lib/content-types";
import { downloadImageUrl } from "@/lib/download-image";
import { toast } from "sonner";

interface ProjectDetailProps {
  project: ProjectListItem;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const BackArrow = locale === "ar" ? ArrowRight : ArrowLeft;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: getLocalizedField(project, "title", locale),
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleDownload = async (url: string, index: number) => {
    try {
      const slug = project.slug || "project";
      await downloadImageUrl(url, `${slug}-${index + 1}.jpg`);
    } catch {
      toast.error(t("noResults"));
    }
  };

  return (
    <div className="pt-24 md:pt-32 pb-20">
      <div className="container mx-auto px-4 lg:px-8">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-8"
        >
          <BackArrow className="h-4 w-4" />
          {t("title")}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          <div>
            <div
              className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border cursor-pointer"
              onClick={() => setLightboxIndex(0)}
            >
              <Image
                src={project.images[0]?.url || BRAND_LOGO}
                alt={getLocalizedField(project, "title", locale)}
                fill
                className="object-cover"
                priority
                loading="eager"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            {project.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-2">
                {project.images.slice(1, 5).map((img, i) => (
                  <div
                    key={img.id}
                    className="relative aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                    onClick={() => setLightboxIndex(i + 1)}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" sizes="150px" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            {project.category && (
              <span className="text-sm text-primary font-medium uppercase tracking-wider">
                {getLocalizedField(project.category, "name", locale)}
              </span>
            )}
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-6">
              {getLocalizedField(project, "title", locale)}
            </h1>
            <p className="text-muted leading-relaxed mb-8">
              {getLocalizedField(project, "description", locale)}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {project.client && (
                <div>
                  <span className="text-xs text-muted uppercase">{t("client")}</span>
                  <p className="font-medium">{project.client}</p>
                </div>
              )}
              {project.location && (
                <div>
                  <span className="text-xs text-muted uppercase">{t("location")}</span>
                  <p className="font-medium">{project.location}</p>
                </div>
              )}
              {project.year && (
                <div>
                  <span className="text-xs text-muted uppercase">{t("year")}</span>
                  <p className="font-medium">{project.year}</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                {t("share")}
              </Button>
              {project.images[0] && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => void handleDownload(project.images[0].url, 0)}
                >
                  <Download className="h-4 w-4" />
                  {t("downloadImage")}
                </Button>
              )}
            </div>
          </div>
        </div>

        {project.images.length > 1 && (
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">{t("gallery")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {project.images.map((img, i) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setLightboxIndex(i)}
                >
                  <Image
                    src={img.url}
                    alt={getLocalizedField(img, "alt", locale) || ""}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 start-4 z-10"
              onClick={(e) => {
                e.stopPropagation();
                if (lightboxIndex !== null) {
                  void handleDownload(project.images[lightboxIndex].url, lightboxIndex);
                }
              }}
            >
              <Download className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 end-4 z-10"
              onClick={() => setLightboxIndex(null)}
            >
              <X className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute start-4 top-1/2 -translate-y-1/2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null ? (prev - 1 + project.images.length) % project.images.length : null
                );
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div className="relative w-full max-w-5xl aspect-[4/3] mx-4" onClick={(e) => e.stopPropagation()}>
              <Image
                src={project.images[lightboxIndex].url}
                alt=""
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute end-4 top-1/2 -translate-y-1/2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((prev) =>
                  prev !== null ? (prev + 1) % project.images.length : null
                );
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
