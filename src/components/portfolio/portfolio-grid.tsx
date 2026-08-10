"use client";

import dynamic from "next/dynamic";
import { useTranslations, useLocale } from "next-intl";
import { getLocalizedField } from "@/lib/utils";
import type { CategoryItem, ProjectListItem } from "@/lib/content-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ProjectCard } from "@/components/portfolio/project-card";
import type { ImageSearchResult } from "@/components/portfolio/image-search-panel";

const ImageSearchPanel = dynamic(
  () =>
    import("@/components/portfolio/image-search-panel").then((mod) => ({
      default: mod.ImageSearchPanel,
    })),
  {
    loading: () => (
      <div
        className="mb-6 h-[7.5rem] animate-pulse rounded-xl border border-border bg-card/40"
        aria-hidden
      />
    ),
  }
);

const PAGE_SIZE = 12;

type PortfolioMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

function ProjectCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-border bg-card">
      <div className="aspect-square bg-muted/20" />
      <div className="space-y-2 px-2 py-3">
        <div className="mx-auto h-3 w-3/4 rounded bg-muted/30" />
        <div className="mx-auto h-3 w-1/2 rounded bg-muted/20" />
      </div>
    </div>
  );
}

export function PortfolioGrid({
  initialProjects,
  initialMeta,
  categories,
}: {
  initialProjects: ProjectListItem[];
  initialMeta: PortfolioMeta;
  categories: CategoryItem[];
}) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const [activeCategory, setActiveCategory] = useState("all");
  const [projects, setProjects] = useState(initialProjects);
  const [meta, setMeta] = useState(initialMeta);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [similarResults, setSimilarResults] = useState<ImageSearchResult[] | null>(null);
  const requestSeq = useRef(0);

  const fetchPage = useCallback(
    async (page: number, append: boolean) => {
      const seq = ++requestSeq.current;
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (activeCategory !== "all") params.set("category", activeCategory);
      if (debouncedSearch.trim()) params.set("q", debouncedSearch.trim());

      const res = await fetch(`/api/portfolio?${params.toString()}`);
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as {
        items: ProjectListItem[];
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };

      if (seq !== requestSeq.current) return;

      setMeta({
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      });
      setProjects((prev) => (append ? [...prev, ...data.items] : data.items));
    },
    [activeCategory, debouncedSearch]
  );

  const skipInitialFetch = useRef(true);

  useEffect(() => {
    if (skipInitialFetch.current) {
      skipInitialFetch.current = false;
      return;
    }

    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        await fetchPage(1, false);
      } catch {
        if (!cancelled) setProjects([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, debouncedSearch, fetchPage]);

  const loadMore = async () => {
    if (loadingMore || meta.page >= meta.totalPages) return;
    setLoadingMore(true);
    try {
      await fetchPage(meta.page + 1, true);
    } catch {
      /* keep current list */
    } finally {
      setLoadingMore(false);
    }
  };

  const showImageResults = Boolean(similarResults?.length);

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          placeholder={t("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 ps-10 md:h-11"
          aria-label={t("search")}
        />
      </div>

      <ImageSearchPanel results={similarResults} onResults={setSimilarResults} />

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-none sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <Button
          variant={activeCategory === "all" ? "default" : "outline"}
          className="h-10 shrink-0 rounded-full px-4 text-sm sm:h-9"
          onClick={() => setActiveCategory("all")}
        >
          {t("allCategories")}
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={activeCategory === cat.slug ? "default" : "outline"}
            className="h-10 shrink-0 rounded-full px-4 text-sm sm:h-9"
            onClick={() => setActiveCategory(cat.slug)}
          >
            {getLocalizedField(cat, "name", locale)}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProjectCardSkeleton key={i} />
          ))}
        </div>
      ) : !showImageResults && projects.length === 0 ? (
        <p className="py-20 text-center text-muted">{t("noResults")}</p>
      ) : !showImageResults ? (
        <>
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

          {meta.page < meta.totalPages ? (
            <div className="mt-10 flex justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                disabled={loadingMore}
                className="min-w-[10rem]"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t("searchLoading")}
                  </>
                ) : (
                  t("loadMore")
                )}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
