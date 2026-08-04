import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface IconBoxProps {
  icon: LucideIcon;
  size?: "sm" | "md";
  className?: string;
}

export function IconBox({ icon: Icon, size = "md", className }: IconBoxProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/5 text-brand-green",
        size === "sm" ? "h-9 w-9" : "h-11 w-11",
        className
      )}
    >
      <Icon className={size === "sm" ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.5} />
    </div>
  );
}
