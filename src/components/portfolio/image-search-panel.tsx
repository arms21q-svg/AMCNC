"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Camera, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/project-card";
import { compressImageForSearch } from "@/lib/client-image-compress";
import type { ProjectListItem } from "@/lib/content-types";

export type ImageSearchResult = {
  id: string;
  url: string;
  similarity: number;
  project?: { slug: string; titleAr: string; titleEn: string } | null;
};

type ImageSearchPanelProps = {
  onResults: (results: ImageSearchResult[] | null) => void;
  results: ImageSearchResult[] | null;
  projects: ProjectListItem[];
};

export function ImageSearchPanel({
  onResults,
  results,
  projects,
}: ImageSearchPanelProps) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const clearSearch = useCallback(() => {
    onResults(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onResults, previewUrl]);

  const handleImageSearch = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setSearching(true);
      onResults(null);

      let objectUrl: string | null = null;
      try {
        const compressed = await compressImageForSearch(file);
        objectUrl = URL.createObjectURL(compressed);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });

        const formData = new FormData();
        formData.append("image", compressed);

        const res = await fetch("/api/search/image", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Search failed");
        const data = (await res.json()) as { results?: ImageSearchResult[] };
        const nextResults = data.results || [];

        if (nextResults.length === 0) {
          toast.error(t("noResults"));
        } else {
          onResults(nextResults);
        }
      } catch {
        toast.error(t("noResults"));
        clearSearch();
      } finally {
        setSearching(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [clearSearch, onResults, t]
  );

  const resultProjects = results
    ?.map((result) => {
      const project = projects.find((p) => p.slug === result.project?.slug);
      if (!project) return null;
      return { project, similarity: result.similarity };
    })
    .filter(Boolean) as Array<{ project: ProjectListItem; similarity: number }>;

  return (
    <div className="mb-6 space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        className="hidden"
        onChange={handleImageSearch}
        disabled={searching}
      />

      <button
        type="button"
        disabled={searching}
        onClick={() => fileInputRef.current?.click()}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 p-4 text-start transition-colors hover:border-brand-green/40 hover:bg-card active:scale-[0.99] md:p-5"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
          {searching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Camera className="h-5 w-5" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">
            {searching ? "..." : t("similaritySearch")}
          </span>
          <span className="mt-0.5 block text-xs text-muted">{t("uploadImage")}</span>
        </span>
      </button>

      {(previewUrl || results) && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {previewUrl ? (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-[#0a0a0a]">
                  <Image
                    src={previewUrl}
                    alt=""
                    fill
                    className="object-contain p-1"
                    unoptimized
                  />
                </div>
              ) : null}
              <div>
                <h3 className="text-sm font-semibold">{t("similaritySearch")}</h3>
                {results ? (
                  <p className="text-xs text-muted">
                    {results.length} {locale === "ar" ? "نتيجة" : "results"}
                  </p>
                ) : null}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clearSearch} aria-label="Clear">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {resultProjects && resultProjects.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6">
              {resultProjects.map(({ project, similarity }, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  locale={locale}
                  layout="compact"
                  similarity={similarity}
                  similarityLabel={`${similarity}% ${t("similarity")}`}
                  priority={index < 2}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
