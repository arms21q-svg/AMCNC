"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ADMIN } from "@/lib/admin-labels";
import { ADMIN_NAV_ITEMS, isAdminNavActive } from "@/lib/admin-nav-config";

export function AdminDashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ADMIN.dashboard}
      className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {ADMIN_NAV_ITEMS.map((item) => {
        const active = isAdminNavActive(pathname, item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch={false}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              active
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border bg-card text-muted hover:border-primary/30 hover:text-foreground"
            )}
          >
            <item.icon className="h-3.5 w-3.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
