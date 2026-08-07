import dynamic from "next/dynamic";
import { Suspense } from "react";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const ProjectsPageClient = dynamic(
  () =>
    import("@/components/admin/projects-page-client").then((m) => ({
      default: m.ProjectsPageClient,
    })),
  { loading: () => <AdminTableSkeleton rows={4} /> }
);

export default function AdminProjectsPage() {
  return (
    <Suspense fallback={<AdminTableSkeleton rows={4} />}>
      <ProjectsPageClient />
    </Suspense>
  );
}
