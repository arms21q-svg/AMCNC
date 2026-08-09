import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getLocalizedField } from "@/lib/utils";
import { BRAND_LOGO } from "@/lib/brand";
import type { ProjectListItem } from "@/lib/content-types";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: ProjectListItem;
  locale: string;
  priority?: boolean;
  layout?: "default" | "compact";
  similarity?: number;
  similarityLabel?: string;
  className?: string;
};

export function ProjectCard({
  project,
  locale,
  priority = false,
  layout = "default",
  similarity,
  similarityLabel,
  className,
}: ProjectCardProps) {
  const coverImage =
    project.images?.find((img) => img.isCover)?.url ||
    project.images?.[0]?.url ||
    BRAND_LOGO;

  const title = getLocalizedField(project, "title", locale);
  const categoryName = project.category
    ? getLocalizedField(project.category, "name", locale)
    : null;

  const isCompact = layout === "compact";

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      className={cn("group block h-full w-full", className)}
    >
      <article
        className={cn(
          "flex h-full w-full flex-col overflow-hidden transition-colors",
          isCompact
            ? "rounded-lg border border-border bg-card hover:border-brand-green/40"
            : "glass-card glass-card-hover"
        )}
      >
        <div
          className={cn(
            "relative w-full shrink-0 overflow-hidden",
            isCompact
              ? "aspect-square bg-[#0a0a0a] p-3"
              : "aspect-[5/4] bg-black/30 sm:aspect-[4/3]"
          )}
        >
          <Image
            src={coverImage}
            alt={title}
            fill
            priority={priority}
            className={cn(
              "transition-transform duration-300 group-hover:scale-[1.03]",
              isCompact ? "object-contain p-1" : "object-cover"
            )}
            sizes={
              isCompact
                ? "(max-width: 768px) 50vw, 33vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            }
            unoptimized={coverImage.includes("supabase.co")}
          />
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col justify-center",
            isCompact ? "px-2 py-3 text-center" : "min-h-[5rem] p-5 sm:p-4 md:p-5"
          )}
        >
          {categoryName && !isCompact ? (
            <span className="text-sm font-medium text-brand-green">{categoryName}</span>
          ) : null}
          <h3
            className={cn(
              "font-display font-semibold leading-snug text-foreground transition-colors group-hover:text-brand-green",
              isCompact
                ? "line-clamp-2 text-sm"
                : "mt-1.5 line-clamp-2 text-lg sm:text-xl"
            )}
          >
            {title}
          </h3>
          {(similarityLabel || typeof similarity === "number") && (
            <p className="mt-1 text-xs font-medium text-brand-green">
              {similarityLabel ?? `${similarity}%`}
            </p>
          )}
        </div>
      </article>
    </Link>
  );
}
