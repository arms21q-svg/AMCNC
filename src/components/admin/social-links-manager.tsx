"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN, SOCIAL_PLATFORM_LABELS_AR } from "@/lib/admin-labels";
import { getFloatingIcon } from "@/lib/floating-link-ui";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";
import type { SocialLinkItem } from "@/lib/social-links.server";

const PLATFORM_OPTIONS = [
  "instagram",
  "facebook",
  "twitter",
  "linkedin",
  "youtube",
  "tiktok",
  "snapchat",
  "telegram",
] as const;

const emptyForm = {
  platform: "instagram",
  url: "",
  order: 0,
  active: true,
};

export function SocialLinksManager() {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ links?: SocialLinkItem[] }>(
        "/api/admin/social-links"
      );
      if (isActive()) setLinks(data.links || []);
    } catch {
      if (isActive()) toast.error("تعذر تحميل روابط التواصل");
    }
  }, []);

  const { loading, reload: load } = useMountFetch(fetchData);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (link: SocialLinkItem) => {
    setEditingId(link.id);
    setForm({
      platform: link.platform,
      url: link.url,
      order: link.order,
      active: link.active,
    });
    setShowForm(true);
  };

  const saveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...form,
        icon: form.platform,
      };

      const res = await fetch(
        editingId ? `/api/admin/social-links/${editingId}` : "/api/admin/social-links",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("save failed");

      toast.success(editingId ? "تم تحديث الرابط" : "تم إضافة الرابط");
      resetForm();
      await load();
    } catch {
      toast.error("تعذر حفظ الرابط");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (link: SocialLinkItem) => {
    try {
      const res = await fetch(`/api/admin/social-links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, active: !link.active }),
      });
      if (!res.ok) throw new Error("toggle failed");
      await load();
    } catch {
      toast.error("تعذر تحديث الحالة");
    }
  };

  const deleteLink = async (id: string) => {
    if (!confirm("حذف هذا الرابط؟")) return;

    try {
      const res = await fetch(`/api/admin/social-links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toast.success("تم الحذف");
      await load();
    } catch {
      toast.error("تعذر الحذف");
    }
  };

  if (loading) {
    return <p className="text-muted text-sm">{ADMIN.loading}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">روابط التواصل الاجتماعي</h2>
          <p className="text-muted mt-1 text-sm">
            تظهر في تذييل الصفحة الرئيسية وباقي الصفحات
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          {ADMIN.addLink}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? ADMIN.edit : ADMIN.addLink}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveLink} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="platform">المنصة</Label>
                <select
                  id="platform"
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                >
                  {PLATFORM_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {SOCIAL_PLATFORM_LABELS_AR[p] || p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="order">الترتيب</Label>
                <Input
                  id="order"
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="url">الرابط</Label>
                <Input
                  id="url"
                  type="url"
                  required
                  placeholder="https://instagram.com/yourpage"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                />
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? ADMIN.saving : ADMIN.save}
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  {ADMIN.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>الروابط ({links.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {links.length === 0 ? (
            <p className="text-muted text-sm">لا توجد روابط بعد. أضف رابطاً جديداً.</p>
          ) : (
            links.map((link) => {
              const Icon = getFloatingIcon(link.icon || link.platform);
              return (
                <div
                  key={link.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {SOCIAL_PLATFORM_LABELS_AR[link.platform] || link.platform}
                    </p>
                    <p className="text-muted truncate text-xs">{link.url}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleActive(link)}
                      aria-label={link.active ? "إخفاء" : "إظهار"}
                    >
                      {link.active ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(link)}
                      aria-label={ADMIN.edit}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLink(link.id)}
                      aria-label={ADMIN.delete}
                    >
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
