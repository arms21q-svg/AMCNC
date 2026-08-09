"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Camera, FolderOpen, Loader2, X, AlertCircle, ImageOff, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/portfolio/project-card";
import { compressImageForSearch } from "@/lib/client-image-compress";
import { computeClientImageHash } from "@/lib/client-image-hash";
import { getUserErrorMessage } from "@/lib/api-errors";
import { downloadBlob } from "@/lib/download-image";
import type { ProjectListItem } from "@/lib/content-types";

export type ImageSearchResult = {
  id: string;
  url: string;
  similarity: number;
  project?: { slug: string; titleAr: string; titleEn: string } | null;
};

type SearchState = "idle" | "loading" | "success" | "empty" | "error";

type ImageSearchPanelProps = {
  onResults: (results: ImageSearchResult[] | null) => void;
  results: ImageSearchResult[] | null;
  projects: ProjectListItem[];
};

const clientCache = new Map<string, ImageSearchResult[]>();

async function searchByHash(hash: string, signal: AbortSignal) {
  const res = await fetch("/api/search/image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hash }),
    signal,
  });

  if (!res.ok) {
    const payload = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(getUserErrorMessage(res.status, payload?.error));
  }

  const data = (await res.json()) as { results?: ImageSearchResult[] };
  return data.results || [];
}

export function ImageSearchPanel({
  onResults,
  results,
  projects,
}: ImageSearchPanelProps) {
  const t = useTranslations("portfolio");
  const locale = useLocale();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const filesInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const activeFileKeyRef = useRef<string | null>(null);
  const searchFileRef = useRef<File | null>(null);
  const [searchFile, setSearchFile] = useState<File | null>(null);
  const [searchState, setSearchState] = useState<SearchState>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const searching = searchState === "loading";

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clearSearch = useCallback(() => {
    abortRef.current?.abort();
    activeFileKeyRef.current = null;
    searchFileRef.current = null;
    setSearchFile(null);
    onResults(null);
    setSearchState("idle");
    setErrorMessage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (filesInputRef.current) filesInputRef.current.value = "";
  }, [onResults, previewUrl]);

  const runImageSearch = useCallback(
    async (file: File) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setSearchState("loading");
      setErrorMessage(null);
      onResults(null);

      let objectUrl: string | null = null;
      try {
        const compressed = await compressImageForSearch(file);
        const imageHash = await computeClientImageHash(compressed);

        if (activeFileKeyRef.current === imageHash && searching) return;
        activeFileKeyRef.current = imageHash;

        searchFileRef.current = compressed;
        setSearchFile(compressed);
        objectUrl = URL.createObjectURL(compressed);
        setPreviewUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return objectUrl;
        });

        const cached = clientCache.get(imageHash);
        if (cached) {
          onResults(cached);
          setSearchState(cached.length > 0 ? "success" : "empty");
          return;
        }

        const nextResults = await searchByHash(imageHash, controller.signal);

        if (clientCache.size > 50) {
          const oldest = clientCache.keys().next().value;
          if (oldest) clientCache.delete(oldest);
        }
        clientCache.set(imageHash, nextResults);

        if (nextResults.length === 0) {
          setSearchState("empty");
        } else {
          onResults(nextResults);
          setSearchState("success");
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSearchState("error");
        setErrorMessage(
          error instanceof Error ? error.message : getUserErrorMessage(500)
        );
        onResults(null);
      } finally {
        if (cameraInputRef.current) cameraInputRef.current.value = "";
        if (filesInputRef.current) filesInputRef.current.value = "";
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [onResults, searching]
  );

  const handleImageSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void runImageSearch(file);
    },
    [runImageSearch]
  );

  const handleDownloadSearchImage = useCallback(async () => {
    const file = searchFileRef.current;
    if (!file) return;

    setDownloading(true);
    try {
      const ext = file.type.includes("png") ? "png" : "jpg";
      const baseName = file.name.replace(/\.[^.]+$/, "") || "search-image";
      downloadBlob(file, `${baseName}.${ext}`);
    } catch {
      setErrorMessage(t("searchError"));
    } finally {
      setDownloading(false);
    }
  }, [t]);

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
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        capture="environment"
        className="hidden"
        onChange={handleImageSearch}
        disabled={searching}
      />
      <input
        ref={filesInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleImageSearch}
        disabled={searching}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={searching}
          onClick={() => cameraInputRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 p-4 text-start transition-colors hover:border-brand-green/40 hover:bg-card active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
            {searching ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              {searching ? t("searchLoading") : t("takePhoto")}
            </span>
            <span className="mt-0.5 block text-xs text-muted">{t("similaritySearch")}</span>
          </span>
        </button>

        <button
          type="button"
          disabled={searching}
          onClick={() => filesInputRef.current?.click()}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-card/60 p-4 text-start transition-colors hover:border-brand-green/40 hover:bg-card active:scale-[0.99]"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
            <FolderOpen className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-foreground">
              {t("pickFromFiles")}
            </span>
            <span className="mt-0.5 block text-xs text-muted">{t("uploadImage")}</span>
          </span>
        </button>
      </div>

      {(previewUrl || results || searchState === "empty" || searchState === "error") && (
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
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{t("similaritySearch")}</h3>
                {searchState === "loading" ? (
                  <p className="text-xs text-muted">{t("searchLoading")}</p>
                ) : results ? (
                  <p className="text-xs text-muted">
                    {results.length} {locale === "ar" ? "نتيجة" : "results"}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              {searchFile ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDownloadSearchImage}
                  disabled={downloading}
                  aria-label={t("downloadSearchImage")}
                  title={t("downloadSearchImage")}
                >
                  {downloading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                </Button>
              ) : null}
              <Button variant="ghost" size="icon" onClick={clearSearch} aria-label="Clear">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {searchFile ? (
            <div className="mb-4">
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={handleDownloadSearchImage}
                disabled={downloading}
              >
                {downloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {t("downloadSearchImage")}
              </Button>
            </div>
          ) : null}

          {searchState === "loading" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-muted">
              <Loader2 className="h-8 w-8 animate-spin text-brand-green" />
              <p className="text-sm">{t("searchLoading")}</p>
            </div>
          ) : null}

          {searchState === "empty" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted">
              <ImageOff className="h-8 w-8" />
              <p className="text-sm">{t("searchEmpty")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => filesInputRef.current?.click()}>
                  {t("pickFromFiles")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => cameraInputRef.current?.click()}>
                  {t("takePhoto")}
                </Button>
              </div>
            </div>
          ) : null}

          {searchState === "error" ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <p className="text-sm text-muted">{errorMessage || t("searchError")}</p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => filesInputRef.current?.click()}>
                  {t("pickFromFiles")}
                </Button>
                <Button size="sm" variant="outline" onClick={() => cameraInputRef.current?.click()}>
                  {t("takePhoto")}
                </Button>
              </div>
            </div>
          ) : null}

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
