"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";
import { parseJsonResponse } from "@/lib/parse-json-response";
import { validateImageFile } from "@/lib/image-upload";
import { downloadAdminImage } from "@/lib/download-image";
import { useAdminList } from "@/hooks/use-admin-list";
import { useAdminImagesOptional, type LibraryImage } from "@/components/admin/admin-images-provider";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  selectMode?: boolean;
}

export function MediaLibrary({ onSelect, selectMode = false }: MediaLibraryProps) {
  const cache = useAdminImagesOptional();
  const [uploading, setUploading] = useState(false);
  const [localQuery, setLocalQuery] = useState("");

  const handleLoadError = useCallback(() => {
    toast.error("تعذر تحميل المحفوظات");
  }, []);

  const paged = useAdminList<"images", LibraryImage>({
    endpoint: "/api/admin/images",
    listKey: "images",
    limit: 24,
    enabled: !selectMode,
    onError: handleLoadError,
  });

  useEffect(() => {
    if (selectMode) {
      void cache?.ensureLoaded();
    }
  }, [selectMode, cache]);

  const images = useMemo(
    () => (selectMode ? cache?.images || [] : paged.items),
    [selectMode, cache?.images, paged.items]
  );
  const loading = selectMode ? cache?.loading && !cache.loaded : paged.loading;
  const meta = paged.meta;

  const filteredImages = useMemo(() => {
    if (!selectMode || !localQuery.trim()) return images;
    const q = localQuery.trim().toLowerCase();
    return images.filter(
      (image) =>
        image.url.toLowerCase().includes(q) ||
        image.altAr?.toLowerCase().includes(q) ||
        image.altEn?.toLowerCase().includes(q) ||
        image.project?.titleAr.toLowerCase().includes(q)
    );
  }, [images, localQuery, selectMode]);

  const refresh = useCallback(async () => {
    if (selectMode) {
      await cache?.reload();
    } else {
      await paged.reload();
    }
  }, [cache, paged, selectMode]);

  const handleUpload = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "library");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      await parseJsonResponse(res);
      toast.success("تم رفع الصورة إلى المحفوظات");
      cache?.invalidate();
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه الصورة؟")) return;
    try {
      const res = await fetch(`/api/admin/images/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("failed");
      toast.success("تم الحذف");
      cache?.invalidate();
      await refresh();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const displayImages = selectMode ? filteredImages : images;
  const totalLabel = selectMode ? displayImages.length : meta.total;

  return (
    <div className="space-y-6">
      {!selectMode && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">{ADMIN.mediaLibrary}</h2>
            <p className="text-muted mt-1 text-sm">{ADMIN.mediaLibraryHint}</p>
          </div>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleUpload(file);
                e.target.value = "";
              }}
            />
            <Button type="button" disabled={uploading} asChild>
              <span>
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {ADMIN.uploadImage}
              </span>
            </Button>
          </label>
        </div>
      )}

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>
            {ADMIN.savedImages} ({totalLabel})
          </CardTitle>
          <AdminSearch
            value={selectMode ? localQuery : paged.search}
            onChange={selectMode ? setLocalQuery : paged.setSearch}
            placeholder="بحث في الصور..."
          />
        </CardHeader>
        <CardContent>
          {loading && displayImages.length === 0 ? (
            <AdminTableSkeleton rows={3} />
          ) : displayImages.length === 0 ? (
            <p className="text-muted text-sm">{ADMIN.noSavedImages}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {displayImages.map((image) => (
                  <div
                    key={image.id}
                    className="group overflow-hidden rounded-lg border border-border bg-card"
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={image.url}
                        alt={image.altAr || ""}
                        fill
                        className="object-cover"
                        sizes="200px"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-2 p-2">
                      {image.project && (
                        <p className="truncate text-xs text-muted">{image.project.titleAr}</p>
                      )}
                      <div className="flex gap-1">
                        {selectMode && onSelect && (
                          <Button
                            type="button"
                            size="sm"
                            className="flex-1 text-xs"
                            onClick={() => onSelect(image.url)}
                          >
                            {ADMIN.selectImage}
                          </Button>
                        )}
                        {!selectMode && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => downloadAdminImage(image.id)}
                            >
                              <Download className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-destructive"
                              onClick={() => void handleDelete(image.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!selectMode && (
                <AdminPagination meta={meta} onPageChange={paged.setPage} disabled={paged.fetching} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
