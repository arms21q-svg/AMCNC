"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, Download, X, Loader2, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { validateImageFile } from "@/lib/image-upload";
import { parseJsonResponse } from "@/lib/parse-json-response";
import { downloadAdminImage, downloadImageUrl } from "@/lib/download-image";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  imageId?: string;
  className?: string;
  onPickFromLibrary?: () => void;
}

export function ImageUploader({
  label,
  value,
  onChange,
  folder = "uploads",
  imageId,
  className,
  onPickFromLibrary,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await parseJsonResponse<{ url: string; id: string }>(res);
      onChange(data.url);
      toast.success("تم رفع الصورة");
    } catch {
      toast.error("فشل رفع الصورة");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDownload = async () => {
    try {
      if (imageId) {
        downloadAdminImage(imageId);
        return;
      }
      if (value) {
        await downloadImageUrl(value, "image.jpg");
      }
    } catch {
      toast.error("فشل تنزيل الصورة");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>

      {value ? (
        <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border border-border bg-black/20">
          <Image src={value} alt="" fill className="object-cover" sizes="320px" unoptimized />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-2 end-2 h-8 w-8 bg-black/50 hover:bg-black/70"
            onClick={() => onChange("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          رفع من الجهاز
        </Button>
        {onPickFromLibrary && (
          <Button type="button" variant="outline" size="sm" onClick={onPickFromLibrary}>
            <Images className="h-4 w-4" />
            من المحفوظات
          </Button>
        )}
        {value && (
          <Button type="button" variant="outline" size="sm" onClick={() => void handleDownload()}>
            <Download className="h-4 w-4" />
            تنزيل
          </Button>
        )}
      </div>

      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="أو ألصق رابط الصورة..."
        dir="ltr"
      />
    </div>
  );
}
