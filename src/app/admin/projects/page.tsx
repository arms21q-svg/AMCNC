import { Suspense } from "react";
import { ProjectsPageClient } from "@/components/admin/projects-page-client";
import { ADMIN } from "@/lib/admin-labels";

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<p className="text-muted text-sm">{ADMIN.loading}</p>}>
      <ProjectsPageClient />
    </Suspense>
  );
}
