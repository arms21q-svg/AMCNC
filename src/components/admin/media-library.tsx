"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Download, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";
import { parseJsonResponse } from "@/lib/parse-json-response";
import { validateImageFile } from "@/lib/image-upload";
import { downloadAdminImage } from "@/lib/download-image";

interface LibraryImage {
  id: string;
  url: string;
  altAr: string | null;
  altEn: string | null;
  createdAt: string;
  project?: { slug: string; titleAr: string } | null;
}

interface MediaLibraryProps {
  onSelect?: (url: string) => void;
  selectMode?: boolean;
}

export function MediaLibrary({ onSelect, selectMode = false }: MediaLibraryProps) {
  const [images, setImages] = useState<LibraryImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ images?: LibraryImage[] }>("/api/admin/images");
      if (isActive()) setImages(data.images || []);
    } catch {
      if (isActive()) toast.error("تعذر تحميل المحفوظات");
    }
  }, []);

  const { loading, reload } = useMountFetch(fetchData);

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
      formData.append("folder", "uploads");
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      await parseJsonResponse(res);
      toast.success("تم رفع الصورة إلى المحفوظات");
      reload();
    } catch {
      toast.error("فشل رفع الصورة");
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
      reload();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  return (
    <div className="space-y-6">
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

      <Card>
        <CardHeader>
          <CardTitle>
            {ADMIN.savedImages} ({images.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted text-sm">{ADMIN.loading}</p>
          ) : images.length === 0 ? (
            <p className="text-muted text-sm">{ADMIN.noSavedImages}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {images.map((image) => (
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
                      unoptimized
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
