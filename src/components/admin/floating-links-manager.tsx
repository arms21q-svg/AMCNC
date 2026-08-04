"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FloatingLinkItem } from "@/lib/floating-links-defaults";
import { ADMIN, COLOR_LABELS_AR, ICON_LABELS_AR } from "@/lib/admin-labels";
import {
  COLOR_OPTIONS,
  ICON_OPTIONS,
  getFloatingColorClass,
  getFloatingIcon,
} from "@/lib/floating-link-ui";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";

const emptyForm = {
  labelAr: "",
  labelEn: "",
  url: "",
  icon: "link",
  color: "green",
  order: 0,
  active: true,
  openInNewTab: true,
};

const emptyContact = {
  phone: "",
  whatsapp: "",
  address_ar: "",
  address_en: "",
  maps_url: "",
};

export function FloatingLinksManager() {
  const [links, setLinks] = useState<FloatingLinkItem[]>([]);
  const [contact, setContact] = useState(emptyContact);
  const [saving, setSaving] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    try {
      const [linksData, settingsData] = await Promise.all([
        fetchJson<{ links?: FloatingLinkItem[] }>("/api/admin/floating-links"),
        fetchJson<{ contact?: Record<string, string> }>("/api/admin/settings").catch(
          () => ({ contact: {} as Record<string, string> })
        ),
      ]);
      if (!isActive()) return;
      setLinks(linksData.links || []);

      const c = settingsData.contact || {};
      if (!isActive()) return;
      setContact({
        phone: c.phone || "",
        whatsapp: c.whatsapp || "",
        address_ar: c.addressAr || "",
        address_en: c.addressEn || "",
        maps_url: c.mapsUrl || "",
      });
    } catch {
      if (isActive()) toast.error("تعذر تحميل البيانات");
    }
  }, []);

  const { loading, reload: load } = useMountFetch(fetchData);

  const saveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingContact(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "contact",
          data: contact,
          syncFloating: true,
        }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success("تم حفظ التواصل وتحديث الزر العائم");
      load();
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSavingContact(false);
    }
  };

  const resetForm = () => {
    setForm({ ...emptyForm, order: links.length + 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (link: FloatingLinkItem) => {
    setEditingId(link.id);
    setForm({
      labelAr: link.labelAr,
      labelEn: link.labelEn,
      url: link.url,
      icon: link.icon,
      color: link.color,
      order: link.order,
      active: link.active,
      openInNewTab: link.openInNewTab,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = editingId
        ? await fetch(`/api/admin/floating-links/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/admin/floating-links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });

      if (!res.ok) throw new Error("Failed");
      toast.success(editingId ? "تم التحديث" : "تمت الإضافة");
      resetForm();
      load();
    } catch {
      toast.error("فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا الرابط؟")) return;
    try {
      const res = await fetch(`/api/admin/floating-links/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      toast.success("تم الحذف");
      load();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const toggleActive = async (link: FloatingLinkItem) => {
    try {
      const res = await fetch(`/api/admin/floating-links/${link.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...link, active: !link.active }),
      });
      if (!res.ok) throw new Error("Failed");
      load();
    } catch {
      toast.error("فشل التحديث");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{ADMIN.floatingButton}</h2>
        <p className="text-muted mt-1 text-sm">إدارة التواصل والروابط في الزر العائم</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            {ADMIN.contactInfo}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted mb-4 text-sm">{ADMIN.syncLinksHint}</p>
          <form onSubmit={saveContact} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{ADMIN.phone}</Label>
              <Input
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="+9647700000000"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.whatsapp}</Label>
              <Input
                value={contact.whatsapp}
                onChange={(e) => setContact({ ...contact, whatsapp: e.target.value })}
                placeholder="9647700000000"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.locationAr}</Label>
              <Input
                value={contact.address_ar}
                onChange={(e) => setContact({ ...contact, address_ar: e.target.value })}
                placeholder="بغداد، العراق"
              />
            </div>
            <div className="space-y-2">
              <Label>{ADMIN.locationEn}</Label>
              <Input
                value={contact.address_en}
                onChange={(e) => setContact({ ...contact, address_en: e.target.value })}
                placeholder="Baghdad, Iraq"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>{ADMIN.mapsUrl}</Label>
              <Input
                value={contact.maps_url}
                onChange={(e) => setContact({ ...contact, maps_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                dir="ltr"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={savingContact}>
                {savingContact ? ADMIN.saving : ADMIN.saveAndSync}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-semibold">{ADMIN.extraLinks}</h3>
        <Button
          className="gap-2"
          onClick={() => {
            setForm({ ...emptyForm, order: links.length + 1 });
            setEditingId(null);
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
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>{ADMIN.nameAr}</Label>
                <Input
                  value={form.labelAr}
                  onChange={(e) => setForm({ ...form, labelAr: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label>{ADMIN.nameEn}</Label>
                <Input
                  value={form.labelEn}
                  onChange={(e) => setForm({ ...form, labelEn: e.target.value })}
                  className="mt-1.5"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label>{ADMIN.url}</Label>
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://... أو /contact"
                  className="mt-1.5"
                  dir="ltr"
                  required
                />
              </div>
              <div>
                <Label>{ADMIN.icon}</Label>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {ICON_LABELS_AR[icon] || icon}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{ADMIN.color}</Label>
                <select
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="mt-1.5 flex h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                >
                  {COLOR_OPTIONS.map((color) => (
                    <option key={color} value={color}>
                      {COLOR_LABELS_AR[color] || color}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>{ADMIN.order}</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className="mt-1.5"
                />
              </div>
              <div className="flex flex-col justify-end gap-3 sm:col-span-2 sm:flex-row">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  {ADMIN.active}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.openInNewTab}
                    onChange={(e) => setForm({ ...form, openInNewTab: e.target.checked })}
                  />
                  {ADMIN.openNewTab}
                </label>
              </div>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? ADMIN.saving : ADMIN.save}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {ADMIN.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {ADMIN.currentLinks} ({links.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted text-sm">{ADMIN.loading}</p>
          ) : links.length === 0 ? (
            <p className="text-muted text-sm">{ADMIN.noLinks}</p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => {
                const Icon = getFloatingIcon(link.icon);
                return (
                  <div
                    key={link.id}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3"
                  >
                    <GripVertical className="text-muted h-4 w-4" />
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${getFloatingColorClass(link.color)}`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{link.labelAr}</p>
                      <p className="text-muted truncate text-xs" dir="ltr">
                        {link.url}
                      </p>
                    </div>
                    <span className="text-muted text-xs">#{link.order}</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(link)}>
                        {link.active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => startEdit(link)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(link.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
