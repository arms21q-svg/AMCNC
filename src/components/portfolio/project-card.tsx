import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocalizedField } from "@/lib/utils";
import { BRAND_LOGO } from "@/lib/brand";
import type { ProjectListItem } from "@/lib/content-types";

type ProjectCardProps = {
  project: ProjectListItem;
  locale: string;
  priority?: boolean;
};

export function ProjectCard({ project, locale, priority = false }: ProjectCardProps) {
  const coverImage =
    project.images?.find((img) => img.isCover)?.url ||
    project.images?.[0]?.url ||
    BRAND_LOGO;

  const title = getLocalizedField(project, "title", locale);
  const categoryName = project.category
    ? getLocalizedField(project.category, "name", locale)
    : null;

  return (
    <Link href={`/portfolio/${project.slug}`} className="group block h-full w-full">
      <article className="glass-card glass-card-hover flex h-full w-full flex-col overflow-hidden">
        <div className="relative aspect-[5/4] w-full shrink-0 overflow-hidden bg-black/30 sm:aspect-[4/3]">
          <Image
            src={coverImage}
            alt={title}
            fill
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
        <div className="flex min-h-[5rem] flex-1 flex-col justify-center p-5 sm:p-4 md:p-5">
          {categoryName ? (
            <span className="text-sm font-medium text-brand-green">{categoryName}</span>
          ) : null}
          <h3 className="mt-1.5 line-clamp-2 font-display text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-green sm:text-xl">
            {title}
          </h3>
        </div>
      </article>
    </Link>
  );
}
