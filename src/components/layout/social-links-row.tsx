import { getFloatingIcon } from "@/lib/floating-link-ui";
import { SOCIAL_PLATFORM_LABELS_AR } from "@/lib/admin-labels";
import { cn } from "@/lib/utils";

type SocialLink = {
  id: string;
  url: string;
  platform: string;
  icon?: string | null;
};

type SocialLinksRowProps = {
  links: SocialLink[];
  locale: string;
  className?: string;
  iconClassName?: string;
};

export function SocialLinksRow({
  links,
  locale,
  className,
  iconClassName,
}: SocialLinksRowProps) {
  if (links.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {links.map((link) => {
        const Icon = getFloatingIcon(link.icon || link.platform);
        const label =
          locale === "ar"
            ? SOCIAL_PLATFORM_LABELS_AR[link.platform] || link.platform
            : link.platform;

        return (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand-gold hover:text-brand-gold",
              iconClassName
            )}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
