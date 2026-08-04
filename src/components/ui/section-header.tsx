import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      <p className="text-brand-green text-sm font-semibold tracking-wide mb-3">
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-muted text-base leading-relaxed">{description}</p>
      )}
    </div>
  );
}
