"use client";

import { motion } from "framer-motion";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLocalizedField } from "@/lib/utils";
import { BRAND_LOGO } from "@/lib/brand";
import type { CategoryItem, ProjectListItem } from "@/lib/content-types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, X } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface SimilarResult {
  id: string;
  url: string;
  similarity: number;
  project?: { slug: string; titleAr: string; titleEn: string } | null;
}

export function PortfolioGrid({
  projects,
  categories,
}: {
  projects: ProjectListItem[];
  categories: CategoryItem[];
}) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [similarResults, setSimilarResults] = useState<SimilarResult[] | null>(null);
  const [searching, setSearching] = useState(false);

  const filtered = projects.filter((p) => {
    const title = getLocalizedField(p, "title", locale).toLowerCase();
    const matchesSearch = title.includes(search.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || p.category?.slug === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleImageSearch = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSearching(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/search/image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setSimilarResults(data.results);
      } catch {
        toast.error(t("noResults"));
      } finally {
        setSearching(false);
      }
    },
    [t]
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
          />
        </div>
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSearch}
            disabled={searching}
          />
          <Button variant="outline" asChild disabled={searching}>
            <span>
              <Upload className="h-4 w-4" />
              {searching ? "..." : t("similaritySearch")}
            </span>
          </Button>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory("all")}
        >
          {t("allCategories")}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.slug ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(cat.slug)}
          >
            {getLocalizedField(cat, "name", locale)}
          </Button>
        ))}
      </div>

      {similarResults && (
        <div className="mb-8 p-4 rounded-xl border border-primary/30 bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{t("similaritySearch")}</h3>
            <Button variant="ghost" size="icon" onClick={() => setSimilarResults(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {similarResults.map((result) => (
              <Link
                key={result.id}
                href={`/portfolio/${result.project?.slug || ""}`}
                className="group"
              >
                <div className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <Image src={result.url} alt="" fill className="object-cover" sizes="200px" />
                  <div className="absolute bottom-0 inset-x-0 bg-background/80 p-2 text-center">
                    <span className="text-xs font-medium text-primary">
                      {result.similarity}% {t("similarity")}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-muted py-20">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, index) => {
            const coverImage =
              project.images?.find((img) => img.isCover)?.url ||
              project.images?.[0]?.url ||
              BRAND_LOGO;

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/portfolio/${project.slug}`} className="group block">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border">
                    <Image
                      src={coverImage}
                      alt={getLocalizedField(project, "title", locale)}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-0 inset-x-0 p-5">
                      {project.category && (
                        <span className="text-xs text-primary font-medium">
                          {getLocalizedField(project.category, "name", locale)}
                        </span>
                      )}
                      <h3 className="font-display text-lg font-semibold">
                        {getLocalizedField(project, "title", locale)}
                      </h3>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
