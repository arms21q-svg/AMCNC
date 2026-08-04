"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  FolderOpen,
  Mail,
  Headphones,
  LogOut,
  Menu,
  X,
  Images,
  Plus,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Logo } from "@/components/layout/logo";
import { Toaster } from "sonner";
import { SetAdminRtl } from "@/components/admin/set-admin-rtl";
import { ADMIN } from "@/lib/admin-labels";

const navItems = [
  { href: "/admin", label: ADMIN.dashboard, icon: LayoutDashboard },
  { href: "/admin/homepage", label: ADMIN.homepage, icon: Home },
  { href: "/admin/projects", label: ADMIN.projects, icon: FolderOpen },
  { href: "/admin/images", label: ADMIN.mediaLibrary, icon: Images },
  { href: "/admin/floating-links", label: ADMIN.floatingButton, icon: Headphones },
  { href: "/admin/social", label: ADMIN.socialLinks, icon: Share2 },
  { href: "/admin/messages", label: ADMIN.messages, icon: Mail },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login";

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return (
      <>
        <SetAdminRtl />
        {children}
        <Toaster richColors closeButton />
      </>
    );
  }

  return (
    <div className="dark min-h-screen bg-background flex">
      <SetAdminRtl />
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-64 bg-card border-e border-border transform transition-transform lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full rtl:-translate-x-0"
        )}
      >
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Logo variant="compact" className="h-9" />
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden ms-auto"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                pathname === item.href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:bg-card hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {ADMIN.logout}
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b border-border bg-card flex items-center px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/admin/projects?add=1" prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 ms-auto hidden sm:inline-flex"
          >
            <Plus className="h-3.5 w-3.5" />
            {ADMIN.addProjectShortcut}
          </Link>
          <Link
            href="/ar"
            target="_blank"
            className="text-sm text-primary hover:underline hidden md:inline ms-2"
          >
            {ADMIN.viewSite}
          </Link>
          <h1 className="font-display text-lg font-semibold ms-2 lg:ms-0">
            {navItems.find((item) => item.href === pathname)?.label || ADMIN.dashboard}
          </h1>
        </header>
        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
      <Toaster richColors closeButton />
    </div>
  );
}
