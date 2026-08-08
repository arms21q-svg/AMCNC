"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { slugify } from "@/lib/utils";
import { ADMIN } from "@/lib/admin-labels";
import { fetchJson } from "@/lib/fetch-json";
import { useAdminList } from "@/hooks/use-admin-list";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { ImageUploader } from "@/components/admin/image-uploader";
import { ImageLibraryDialog } from "@/components/admin/image-library-dialog";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

interface Category {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
}

interface ProjectRow {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  client?: string | null;
  location?: string | null;
  year?: number | null;
  featured: boolean;
  published: boolean;
  order: number;
  categoryId?: string | null;
  category?: Category | null;
  _count?: { images: number };
}

const emptyForm = {
  slug: "",
  titleAr: "",
  titleEn: "",
  descriptionAr: "",
  descriptionEn: "",
  client: "",
  location: "",
  year: "",
  featured: false,
  published: true,
  order: 0,
  categoryId: "",
  coverUrl: "",
  galleryUrls: [] as string[],
};

export function ProjectsManager({ openAddForm = false }: { openAddForm?: boolean }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(openAddForm);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryTarget, setLibraryTarget] = useState<"cover" | "gallery" | null>(null);
  const { runLocked } = useSubmitLock();

  const {
    items: projects,
    meta,
    loading,
    setPage,
    search,
    setSearch,
    reload: load,
  } = useAdminList<"projects", ProjectRow>({
    endpoint: "/api/admin/projects",
    listKey: "projects",
    limit: 20,
    onError: () => toast.error("تعذر تحميل الأعمال"),
  });

  const fetchCategories = useCallback(async (isActive: () => boolean) => {
    try {
      const categoriesData = await fetchJson<{ categories?: Category[] }>(
        "/api/admin/categories"
      ).catch(() => ({ categories: [] as Category[] }));
      if (isActive()) setCategories(categoriesData.categories || []);
    } catch {
      if (isActive()) toast.error("تعذر تحميل الفئات");
    }
  }, []);

  useMountFetch(fetchCategories);

  const resetForm = () => {
    setForm({ ...emptyForm, order: projects.length + 1 });
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = async (project: ProjectRow) => {
    try {
      const data = await fetchJson<{
        project?: ProjectRow & {
          images?: Array<{ url: string; isCover: boolean }>;
        };
      }>(`/api/admin/projects/${project.id}`);

      const images = data.project?.images || [];
      const cover = images.find((img) => img.isCover)?.url || "";
      const gallery = images.filter((img) => !img.isCover).map((img) => img.url);

      setEditingId(project.id);
      setForm({
        slug: project.slug,
        titleAr: project.titleAr,
        titleEn: project.titleEn,
        descriptionAr: project.descriptionAr,
        descriptionEn: project.descriptionEn,
        client: project.client || "",
        location: project.location || "",
        year: project.year?.toString() || "",
        featured: project.featured,
        published: project.published,
        order: project.order,
        categoryId: project.categoryId || "",
        coverUrl: cover,
        galleryUrls: gallery,
      });
      setShowForm(true);
    } catch {
      toast.error("تعذر تحميل بيانات العمل");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await runLocked(async () => {
      setSaving(true);
      try {
        const payload = {
          ...form,
          year: form.year ? Number(form.year) : null,
          client: form.client || null,
          location: form.location || null,
          categoryId: form.categoryId || null,
          coverUrl: form.coverUrl || null,
          galleryUrls: form.galleryUrls.filter(Boolean),
        };

        const res = editingId
          ? await fetch(`/api/admin/projects/${editingId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            })
          : await fetch("/api/admin/projects", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });

        if (!res.ok) throw new Error("Save failed");
        toast.success(editingId ? "تم تحديث العمل" : "تم إضافة العمل");
        resetForm();
        await load();
      } catch {
        toast.error("فشل الحفظ");
      } finally {
        setSaving(false);
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذا العمل؟")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("تم الحذف");
      load();
    } catch {
      toast.error("فشل الحذف");
    }
  };

  const toggleFeatured = async (project: ProjectRow) => {
    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: !project.featured }),
      });
      if (!res.ok) throw new Error("failed");
      toast.success(project.featured ? "تم إلغاء التمييز" : "تم تمييز العمل في الرئيسية");
      load();
    } catch {
      toast.error("فشل التحديث");
    }
  };

  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div className="space-y-6">
      <ImageLibraryDialog
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={(url) => {
          if (libraryTarget === "cover") {
            setForm((prev) => ({ ...prev, coverUrl: url }));
          } else if (libraryTarget === "gallery") {
            setForm((prev) => ({
              ...prev,
              galleryUrls: [...prev.galleryUrls, url],
            }));
          }
        }}
      />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">{ADMIN.projects}</h2>
          <p className="text-muted mt-1 text-sm">
            {ADMIN.projectsOnHomeHint} ({featuredCount} مميز)
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
          {ADMIN.addProject}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? ADMIN.editProject : ADMIN.addProject}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
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
                <Label>{ADMIN.slug}</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{ADMIN.descriptionAr}</Label>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{ADMIN.descriptionEn}</Label>
                <Textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{ADMIN.category}</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">{ADMIN.noCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameEn} / {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <ImageUploader
                  label={ADMIN.coverImage}
                  value={form.coverUrl}
                  onChange={(url) => setForm({ ...form, coverUrl: url })}
                  folder="projects"
                  onPickFromLibrary={() => {
                    setLibraryTarget("cover");
                    setLibraryOpen(true);
                  }}
                />
              </div>
              <div className="space-y-3 md:col-span-2">
                <Label>{ADMIN.galleryImages}</Label>
                {form.galleryUrls.map((url, index) => (
                  <ImageUploader
                    key={`${url}-${index}`}
                    label={`${ADMIN.galleryImages} ${index + 1}`}
                    value={url}
                    onChange={(newUrl) => {
                      const next = [...form.galleryUrls];
                      next[index] = newUrl;
                      setForm({ ...form, galleryUrls: next });
                    }}
                    folder="projects"
                    onPickFromLibrary={() => {
                      setLibraryTarget("gallery");
                      setLibraryOpen(true);
                    }}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setForm({ ...form, galleryUrls: [...form.galleryUrls, ""] })
                  }
                >
                  <Plus className="h-4 w-4" />
                  {ADMIN.addGalleryImage}
                </Button>
              </div>
              <div className="space-y-2">
                <Label>{ADMIN.client}</Label>
                <Input
                  value={form.client}
                  onChange={(e) => setForm({ ...form, client: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{ADMIN.location}</Label>
                <Input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{ADMIN.year}</Label>
                <Input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{ADMIN.order}</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="flex flex-wrap gap-4 md:col-span-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  {ADMIN.featured} — {ADMIN.projectsOnHome}
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  {ADMIN.published}
                </label>
              </div>
              <div className="flex gap-2 md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? ADMIN.saving : editingId ? ADMIN.save : ADMIN.add}
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
        <CardHeader className="space-y-4">
          <CardTitle>
            {ADMIN.allProjects} ({meta.total})
          </CardTitle>
          <AdminSearch value={search} onChange={setSearch} placeholder="بحث في الأعمال..." />
        </CardHeader>
        <CardContent>
          {loading ? (
            <AdminTableSkeleton rows={4} />
          ) : projects.length === 0 ? (
            <div className="space-y-3 text-sm">
              <p className="text-muted">{ADMIN.noProjects}</p>
              {meta.total === 0 ? (
                <>
                  <p className="text-muted">
                    لا توجد أعمال في قاعدة البيانات الحالية — أضف عملاً جديداً من الزر أعلاه.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" onClick={() => setShowForm(true)}>
                      <Plus className="h-4 w-4" />
                      {ADMIN.addProject}
                    </Button>
                    <Button type="button" size="sm" variant="outline" asChild>
                      <Link href="/admin">{ADMIN.seedButton}</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <Button type="button" size="sm" variant="outline" onClick={() => load()}>
                  إعادة تحميل القائمة
                </Button>
              )}
            </div>
          ) : (
            <>
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{project.titleAr}</p>
                      {project.featured && (
                        <Star className="h-4 w-4 text-primary fill-primary" />
                      )}
                      {project.published ? (
                        <Eye className="h-4 w-4 text-green-400" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted" />
                      )}
                    </div>
                    <p className="text-sm text-muted">{project.slug}</p>
                    {project.category && (
                      <p className="text-xs text-muted mt-1">
                        {project.category.nameAr} · {project._count?.images || 0}{" "}
                        {ADMIN.imagesCount}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={project.featured ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleFeatured(project)}
                      title={project.featured ? ADMIN.unmarkFeatured : ADMIN.markFeatured}
                    >
                      <Star className={`h-4 w-4 ${project.featured ? "fill-current" : ""}`} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => startEdit(project)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(project.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <AdminPagination meta={meta} onPageChange={setPage} disabled={loading} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
