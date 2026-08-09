"use client";

import { useTranslations, useLocale } from "next-intl";
import { getLocalizedField } from "@/lib/utils";
import type { CategoryItem, ProjectListItem } from "@/lib/content-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ProjectCard } from "@/components/portfolio/project-card";
import {
  ImageSearchPanel,
  type ImageSearchResult,
} from "@/components/portfolio/image-search-panel";

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
  const [similarResults, setSimilarResults] = useState<ImageSearchResult[] | null>(
    null
  );

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

      <ImageSearchPanel
        results={similarResults}
        onResults={setSimilarResults}
        projects={projects}
      />

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

      {!showImageResults && filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">{t("noResults")}</p>
      ) : !showImageResults ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {filtered.map((project, index) => (
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
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                locale={locale}
                priority={index < 2}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
