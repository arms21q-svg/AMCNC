"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ImageLibraryDialog } from "@/components/admin/image-library-dialog";
import { QuickProjectShortcuts } from "@/components/admin/quick-project-shortcuts";

const fields: Array<{
  key: string;
  label: string;
  textarea?: boolean;
}> = [
  { key: "hero_eyebrow_ar", label: "العنوان الفرعي (عربي)" },
  { key: "hero_eyebrow_en", label: "العنوان الفرعي (إنجليزي)" },
  { key: "hero_title_ar", label: "العنوان (عربي)" },
  { key: "hero_title_en", label: "العنوان (إنجليزي)" },
  { key: "hero_title_highlight_ar", label: "كلمة مميزة (عربي)" },
  { key: "hero_title_highlight_en", label: "كلمة مميزة (إنجليزي)" },
  { key: "hero_title_end_ar", label: "نهاية العنوان (عربي)" },
  { key: "hero_title_end_en", label: "نهاية العنوان (إنجليزي)" },
  { key: "hero_subtitle_ar", label: "الوصف (عربي)", textarea: true },
  { key: "hero_subtitle_en", label: "الوصف (إنجليزي)", textarea: true },
];

export function HomepageManager() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<string | null>(null);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ settings?: Record<string, string> }>(
        "/api/admin/settings?section=homepage"
      );
      if (isActive()) setForm(data.settings || {});
    } catch {
      if (isActive()) toast.error("تعذر تحميل إعدادات الصفحة الرئيسية");
    }
  }, []);

  const { loading } = useMountFetch(fetchData);

  const openLibrary = (key: string) => {
    setLibraryTarget(key);
    setLibraryOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "homepage", data: form }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success("تم حفظ الصفحة الرئيسية");
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <ImageLibraryDialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => {
          if (libraryTarget) {
            setForm((prev) => ({ ...prev, [libraryTarget]: url }));
          }
        }}
      />

      <div>
        <h2 className="font-display text-2xl font-bold">{ADMIN.homepage}</h2>
        <p className="text-muted mt-1 text-sm">{ADMIN.heroSection}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ADMIN.heroSlides}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted text-sm">{ADMIN.heroSlidesHint}</p>
          {loading ? (
            <p className="text-muted text-sm">{ADMIN.loading}</p>
          ) : (
            Array.from({ length: 5 }, (_, i) => {
              const n = i + 1;
              const urlKey = `hero_slide_${n}_url`;
              return (
                <ImageUploader
                  key={urlKey}
                  label={`${ADMIN.slide} ${n}`}
                  value={form[urlKey] || ""}
                  onChange={(url) => setForm((prev) => ({ ...prev, [urlKey]: url }))}
                  folder="hero"
                  onPickFromLibrary={() => openLibrary(urlKey)}
                />
              );
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ADMIN.bannerTexts}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted text-sm">{ADMIN.loading}</p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div
                  key={field.key}
                  className={field.textarea ? "md:col-span-2 space-y-2" : "space-y-2"}
                >
                  <Label>{field.label}</Label>
                  {field.textarea ? (
                    <Textarea
                      value={form[field.key] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={form[field.key] || ""}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? ADMIN.saving : ADMIN.save}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{ADMIN.projectsOnHome}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted text-sm">{ADMIN.projectsOnHomeHint}</p>
          <QuickProjectShortcuts />
        </CardContent>
      </Card>
    </div>
  );
}
