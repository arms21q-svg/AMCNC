"use client";

import Link from "next/link";
import { Plus, FolderOpen, Images, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN } from "@/lib/admin-labels";
import { cn } from "@/lib/utils";

interface QuickProjectShortcutsProps {
  className?: string;
  layout?: "row" | "grid";
}

const shortcuts = [
  {
    id: "add",
    href: "/admin/projects?add=1",
    label: ADMIN.addProjectShortcut,
    icon: Plus,
  },
  {
    id: "manage",
    href: "/admin/projects",
    label: ADMIN.manageProjectsShortcut,
    icon: FolderOpen,
  },
  {
    id: "library",
    href: "/admin/images",
    label: ADMIN.uploadToLibraryShortcut,
    icon: Images,
  },
  {
    id: "featured",
    href: "/admin/projects",
    label: ADMIN.featureOnHomeShortcut,
    icon: Star,
  },
] as const;

export function QuickProjectShortcuts({
  className,
  layout = "row",
}: QuickProjectShortcutsProps) {
  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
          : "flex flex-wrap gap-2",
        className
      )}
    >
      {shortcuts.map((item) => (
        <Button
          key={item.id}
          asChild
          variant={item.id === "add" ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Link href={item.href} prefetch={false}>
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
