"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getLocalizedField } from "@/lib/utils";
import type { CategoryItem, ProjectListItem } from "@/lib/content-types";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Upload, X, Loader2 } from "lucide-react";
import { useMemo, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ProjectCard } from "@/components/portfolio/project-card";

interface SimilarResult {
  id: string;
  url: string;
  similarity: number;
  project?: { slug: string; titleAr: string; titleEn: string } | null;
}

function projectMatchesQuery(
  project: ProjectListItem,
  query: string,
  locale: string
): boolean {
  if (!query) return true;

  const q = query.toLowerCase();
  const title = getLocalizedField(project, "title", locale).toLowerCase();
  const description = getLocalizedField(project, "description", locale).toLowerCase();
  const category = project.category
    ? getLocalizedField(project.category, "name", locale).toLowerCase()
    : "";

  return title.includes(q) || description.includes(q) || category.includes(q);
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
  const debouncedSearch = useDebouncedValue(search, 250);
  const [activeCategory, setActiveCategory] = useState("all");
  const [similarResults, setSimilarResults] = useState<SimilarResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchesSearch = projectMatchesQuery(p, debouncedSearch.trim(), locale);
        const matchesCategory =
          activeCategory === "all" || p.category?.slug === activeCategory;
        return matchesSearch && matchesCategory;
      }),
    [projects, debouncedSearch, activeCategory, locale]
  );

  const handleImageSearch = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSearching(true);
      setSimilarResults(null);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/search/image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Search failed");
        const data = (await res.json()) as { results?: SimilarResult[] };
        const results = data.results || [];

        if (results.length === 0) {
          toast.error(t("noResults"));
        } else {
          setSimilarResults(results);
        }
      } catch {
        toast.error(t("noResults"));
      } finally {
        setSearching(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [t]
  );

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ps-10"
            aria-label={t("search")}
          />
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageSearch}
            disabled={searching}
          />
          <Button
            type="button"
            variant="outline"
            disabled={searching}
            onClick={() => fileInputRef.current?.click()}
            className="w-full md:w-auto"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {searching ? "..." : t("similaritySearch")}
          </Button>
        </div>
      </div>

      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          size="sm"
          className="shrink-0"
          onClick={() => setActiveCategory("all")}
        >
          {t("allCategories")}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.slug ? "default" : "outline"}
            size="sm"
            className="shrink-0"
            onClick={() => setActiveCategory(cat.slug)}
          >
            {getLocalizedField(cat, "name", locale)}
          </Button>
        ))}
      </div>

      {similarResults && similarResults.length > 0 && (
        <div className="mb-8 rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">{t("similaritySearch")}</h3>
            <Button variant="ghost" size="icon" onClick={() => setSimilarResults(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {similarResults.map((result) => {
              const title = result.project
                ? locale === "ar"
                  ? result.project.titleAr
                  : result.project.titleEn
                : "";
              return (
                <Link
                  key={result.id}
                  href={`/portfolio/${result.project?.slug || ""}`}
                  className="group block h-full"
                >
                  <article className="glass-card glass-card-hover flex h-full flex-col overflow-hidden">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={result.url}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, 50vw"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      {title ? (
                        <p className="line-clamp-2 font-display font-semibold group-hover:text-brand-green">
                          {title}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs font-medium text-brand-green">
                        {result.similarity}% {t("similarity")}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">{t("noResults")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
          {filtered.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              locale={locale}
              priority={index < 2}
            />
          ))}
        </div>
      )}
    </div>
  );
}
