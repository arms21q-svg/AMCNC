"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  FolderOpen,
  Images,
  Headphones,
  Share2,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN } from "@/lib/admin-labels";

const items = [
  { href: "/admin", label: ADMIN.dashboard, icon: LayoutDashboard, exact: true },
  { href: "/admin/homepage", label: ADMIN.homepage, icon: Home },
  { href: "/admin/projects", label: ADMIN.projects, icon: FolderOpen },
  { href: "/admin/images", label: ADMIN.mediaLibrary, icon: Images },
  { href: "/admin/floating-links", label: ADMIN.floatingButton, icon: Headphones },
  { href: "/admin/social", label: ADMIN.socialLinks, icon: Share2 },
  { href: "/admin/messages", label: ADMIN.messages, icon: Mail },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDashboardNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label={ADMIN.dashboard}
      className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none"
    >
      {items.map((item) => {
        const active = isActive(pathname, item.href, "exact" in item ? item.exact : false);
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
