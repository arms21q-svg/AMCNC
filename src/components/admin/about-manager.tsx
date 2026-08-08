"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";
import { ImageUploader } from "@/components/admin/image-uploader";
import type { AboutBlock, AboutContent } from "@/lib/about-types";
import { DEFAULT_ABOUT_CONTENT } from "@/lib/about-defaults";

function newBlock(): AboutBlock {
  return {
    id: crypto.randomUUID(),
    titleAr: "",
    titleEn: "",
    bodyAr: "",
    bodyEn: "",
  };
}

export function AboutManager() {
  const [form, setForm] = useState<AboutContent>(DEFAULT_ABOUT_CONTENT);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ content?: AboutContent }>(
        "/api/admin/settings?section=about"
      );
      if (isActive() && data.content) {
        setForm({ ...DEFAULT_ABOUT_CONTENT, ...data.content });
      }
    } catch {
      if (isActive()) toast.error(ADMIN.aboutLoadFailed);
    }
  }, []);

  const { loading } = useMountFetch(fetchData);

  const updateBlock = (id: string, patch: Partial<AboutBlock>) => {
    setForm((prev) => ({
      ...prev,
      blocks: prev.blocks.map((block) =>
        block.id === id ? { ...block, ...patch } : block
      ),
    }));
  };

  const removeBlock = (id: string) => {
    setForm((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((block) => block.id !== id),
    }));
  };

  const addBlock = () => {
    setForm((prev) => ({
      ...prev,
      blocks: [...prev.blocks, newBlock()],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "about", data: form }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success(ADMIN.aboutSaveSuccess);
    } catch {
      toast.error(ADMIN.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted text-sm">{ADMIN.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{ADMIN.aboutPage}</h2>
        <p className="text-muted mt-1 text-sm">{ADMIN.aboutPageHint}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{ADMIN.aboutHeroSection}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{ADMIN.titleAr}</Label>
              <Input
                value={form.titleAr}
                onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.titleEn}</Label>
              <Input
                value={form.titleEn}
                onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.aboutSubtitleAr}</Label>
              <Input
                value={form.subtitleAr}
                onChange={(e) => setForm({ ...form, subtitleAr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.aboutSubtitleEn}</Label>
              <Input
                value={form.subtitleEn}
                onChange={(e) => setForm({ ...form, subtitleEn: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{ADMIN.descriptionAr}</Label>
              <Textarea
                value={form.descriptionAr}
                onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                rows={4}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{ADMIN.descriptionEn}</Label>
              <Textarea
                value={form.descriptionEn}
                onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                rows={4}
              />
            </div>
            <div className="md:col-span-2">
              <ImageUploader
                label={ADMIN.aboutHeroImage}
                value={form.heroImageUrl}
                onChange={(url) => setForm({ ...form, heroImageUrl: url })}
                folder="projects"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ADMIN.aboutMissionVision}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{ADMIN.aboutMissionAr}</Label>
              <Input
                value={form.missionTitleAr}
                onChange={(e) => setForm({ ...form, missionTitleAr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.aboutMissionEn}</Label>
              <Input
                value={form.missionTitleEn}
                onChange={(e) => setForm({ ...form, missionTitleEn: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{ADMIN.aboutMissionTextAr}</Label>
              <Textarea
                value={form.missionTextAr}
                onChange={(e) => setForm({ ...form, missionTextAr: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{ADMIN.aboutMissionTextEn}</Label>
              <Textarea
                value={form.missionTextEn}
                onChange={(e) => setForm({ ...form, missionTextEn: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.aboutVisionAr}</Label>
              <Input
                value={form.visionTitleAr}
                onChange={(e) => setForm({ ...form, visionTitleAr: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.aboutVisionEn}</Label>
              <Input
                value={form.visionTitleEn}
                onChange={(e) => setForm({ ...form, visionTitleEn: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{ADMIN.aboutVisionTextAr}</Label>
              <Textarea
                value={form.visionTextAr}
                onChange={(e) => setForm({ ...form, visionTextAr: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{ADMIN.aboutVisionTextEn}</Label>
              <Textarea
                value={form.visionTextEn}
                onChange={(e) => setForm({ ...form, visionTextEn: e.target.value })}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>{ADMIN.aboutBlocksSection}</CardTitle>
              <p className="text-muted mt-1 text-sm">{ADMIN.aboutBlocksHint}</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addBlock}>
              <Plus className="h-4 w-4" />
              {ADMIN.aboutAddBlock}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{ADMIN.aboutValuesHeadingAr}</Label>
                <Input
                  value={form.valuesHeadingAr}
                  onChange={(e) => setForm({ ...form, valuesHeadingAr: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{ADMIN.aboutValuesHeadingEn}</Label>
                <Input
                  value={form.valuesHeadingEn}
                  onChange={(e) => setForm({ ...form, valuesHeadingEn: e.target.value })}
                />
              </div>
            </div>

            {form.blocks.length === 0 ? (
              <p className="text-muted text-sm">{ADMIN.aboutNoBlocks}</p>
            ) : (
              form.blocks.map((block, index) => (
                <div
                  key={block.id}
                  className="rounded-xl border border-border bg-card/50 p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted">
                      <GripVertical className="h-4 w-4" />
                      {ADMIN.aboutBlock} {index + 1}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeBlock(block.id)}
                      aria-label={ADMIN.delete}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{ADMIN.titleAr}</Label>
                      <Input
                        value={block.titleAr}
                        onChange={(e) =>
                          updateBlock(block.id, { titleAr: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{ADMIN.titleEn}</Label>
                      <Input
                        value={block.titleEn}
                        onChange={(e) =>
                          updateBlock(block.id, { titleEn: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{ADMIN.descriptionAr}</Label>
                      <Textarea
                        value={block.bodyAr}
                        onChange={(e) =>
                          updateBlock(block.id, { bodyAr: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>{ADMIN.descriptionEn}</Label>
                      <Textarea
                        value={block.bodyEn}
                        onChange={(e) =>
                          updateBlock(block.id, { bodyEn: e.target.value })
                        }
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ADMIN.aboutExtraSections}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.showWhyUs}
                onChange={(e) => setForm({ ...form, showWhyUs: e.target.checked })}
                className="rounded border-border"
              />
              {ADMIN.aboutShowWhyUs}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.showStats}
                onChange={(e) => setForm({ ...form, showStats: e.target.checked })}
                className="rounded border-border"
              />
              {ADMIN.aboutShowStats}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.showCta}
                onChange={(e) => setForm({ ...form, showCta: e.target.checked })}
                className="rounded border-border"
              />
              {ADMIN.aboutShowCta}
            </label>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving}>
          {saving ? ADMIN.saving : ADMIN.save}
        </Button>
      </form>
    </div>
  );
}
