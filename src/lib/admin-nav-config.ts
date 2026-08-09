import {
  LayoutDashboard,
  Home,
  FolderOpen,
  Headphones,
  Share2,
  Users,
  UserCog,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { ADMIN } from "@/lib/admin-labels";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: ADMIN.dashboard, icon: LayoutDashboard, exact: true },
  { href: "/admin/homepage", label: ADMIN.homepage, icon: Home },
  { href: "/admin/about", label: ADMIN.aboutPage, icon: Users },
  { href: "/admin/projects", label: ADMIN.projects, icon: FolderOpen },
  { href: "/admin/messages", label: ADMIN.orders, icon: Mail },
  { href: "/admin/floating-links", label: ADMIN.floatingButton, icon: Headphones },
  { href: "/admin/social", label: ADMIN.socialLinks, icon: Share2 },
  { href: "/admin/account", label: ADMIN.accountSettings, icon: UserCog },
];

export function isAdminNavActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}
