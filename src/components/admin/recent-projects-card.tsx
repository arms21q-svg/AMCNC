import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";
import { getRecentProjectsAdmin } from "@/lib/projects.server";
import { cn } from "@/lib/utils";

export async function RecentProjectsCard() {
  const projects = await getRecentProjectsAdmin(5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{ADMIN.recentProjects}</CardTitle>
        <Link href="/admin/projects" className="text-sm text-primary hover:underline">
          {ADMIN.projects} ←
        </Link>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <p className="text-sm text-muted">{ADMIN.noProjects}</p>
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li
                key={project.id}
                className="rounded-lg border border-border px-3 py-2.5 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{project.titleAr}</p>
                    <p className="text-xs text-muted truncate" dir="ltr">
                      {project.slug}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {project.featured ? (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] text-primary">
                        {ADMIN.featured}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        project.published
                          ? "bg-green-500/10 text-green-400"
                          : "bg-muted/20 text-muted"
                      )}
                    >
                      {project.published ? ADMIN.published : "مسودة"}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {new Date(project.updatedAt).toLocaleString("ar-IQ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
