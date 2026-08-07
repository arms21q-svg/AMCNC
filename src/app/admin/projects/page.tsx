import { Suspense } from "react";
import { ProjectsPageClient } from "@/components/admin/projects-page-client";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton rows={4} />}>
      <ProjectsPageClient />
    </Suspense>
  );
}
