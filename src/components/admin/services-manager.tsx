"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";

interface ServiceRow {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon?: string | null;
  image?: string | null;
  order: number;
  active: boolean;
}

const emptyForm = {
  slug: "",
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  icon: "settings",
  image: "",
  order: 0,
  active: true,
};

export function ServicesManager() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const fetchServices = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ services?: ServiceRow[] }>("/api/admin/services");
      if (isActive()) setServices(data.services || []);
    } catch {
      if (isActive()) toast.error("Could not load services. Check database connection.");
    }
  }, []);

  const { loading, reload: load } = useMountFetch(fetchServices);

  const resetForm = () => {
    setForm({ ...emptyForm, order: services.length + 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (service: ServiceRow) => {
    setEditingId(service.id);
    setForm({
      slug: service.slug,
      titleAr: service.titleAr,
      titleEn: service.titleEn,
      descriptionAr: service.descriptionAr,
      descriptionEn: service.descriptionEn,
      icon: service.icon || "settings",
      image: service.image || "",
      order: service.order,
      active: service.active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        icon: form.icon || null,
        image: form.image || null,
      };

      const res = editingId
        ? await fetch(`/api/admin/services/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!res.ok) throw new Error("Save failed");
      toast.success(editingId ? "Service updated" : "Service created");
      resetForm();
      load();
    } catch {
      toast.error("Could not save service");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Service deleted");
      load();
    } catch {
      toast.error("Could not delete service");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Services</h2>
        <Button
          className="gap-2"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Service
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Service" : "New Service"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Title (AR)</Label>
                <Input
                  value={form.titleAr}
                  onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Title (EN)</Label>
                <Input
                  value={form.titleEn}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      titleEn: e.target.value,
                      slug: form.slug || slugify(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Slug</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description (AR)</Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Description (EN)</Label>
                <Textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  Active on website
                </label>
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Services ({services.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted text-sm">Loading...</p>
          ) : services.length === 0 ? (
            <p className="text-muted text-sm">No services yet.</p>
          ) : (
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{service.titleEn}</p>
                      {service.active ? (
                        <Eye className="h-4 w-4 text-green-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted" />
                      )}
                    </div>
                    <p className="text-sm text-muted">{service.slug}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => startEdit(service)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
