import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, FolderOpen, Mail, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAdminStats } from "@/lib/services.server";
import { ADMIN } from "@/lib/admin-labels";
import { SeedDemoCard } from "@/components/admin/seed-demo-card";
import { QuickProjectShortcuts } from "@/components/admin/quick-project-shortcuts";
import { RecentMessagesCard } from "@/components/admin/recent-messages-card";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: ADMIN.projects,
      value: stats.projects,
      icon: FolderOpen,
      color: "text-blue-400",
      href: "/admin/projects",
    },
    {
      label: ADMIN.orders,
      value: stats.messages,
      badge: stats.newMessages > 0 ? stats.newMessages : null,
      icon: Mail,
      color: "text-green-400",
      href: "/admin/messages",
    },
    {
      label: ADMIN.homepage,
      value: "—",
      icon: Home,
      color: "text-primary",
      href: "/admin/homepage",
    },
    {
      label: ADMIN.aboutPage,
      value: "—",
      icon: Users,
      color: "text-amber-400",
      href: "/admin/about",
    },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">{ADMIN.dashboard}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((stat) => (
          <Link key={stat.label} href={stat.href} prefetch={false}>
            <Card className="hover:border-primary/40 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted">
                  {stat.label}
                </CardTitle>
                <stat.icon className={cn("h-4 w-4", stat.color)} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{stat.value}</div>
                  {"badge" in stat && stat.badge ? (
                    <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs font-medium text-green-400">
                      {stat.badge} {ADMIN.newOrders}
                    </span>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>{ADMIN.projectsShortcuts}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted text-sm">{ADMIN.projectsShortcutsHint}</p>
            <QuickProjectShortcuts layout="grid" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{ADMIN.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Link href="/admin/messages" className="text-primary hover:underline">
              {ADMIN.orders}
            </Link>
            <Link href="/admin/homepage" className="text-primary hover:underline">
              تعديل الصفحة الرئيسية
            </Link>
            <Link href="/admin/about" className="text-primary hover:underline">
              تعديل صفحة من نحن
            </Link>
            <Link href="/admin/floating-links" className="text-primary hover:underline">
              رقم التواصل والموقع والزر العائم
            </Link>
            <Link href="/admin/account" className="text-primary hover:underline">
              إدارة الحساب (البريد وكلمة المرور)
            </Link>
            <Link href="/ar/portfolio" target="_blank" className="text-primary hover:underline">
              معاينة أعمالنا ↗
            </Link>
            <Link href="/ar" target="_blank" className="text-primary hover:underline">
              {ADMIN.viewSite} ↗
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <RecentMessagesCard />
      </div>

      <SeedDemoCard />
    </div>
  );
}
