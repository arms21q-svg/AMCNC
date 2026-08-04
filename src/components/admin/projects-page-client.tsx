"use client";

import { useSearchParams } from "next/navigation";
import { ProjectsManager } from "@/components/admin/projects-manager";

export function ProjectsPageClient() {
  const searchParams = useSearchParams();
  const openAddForm = searchParams.get("add") === "1";

  return <ProjectsManager openAddForm={openAddForm} />;
}
