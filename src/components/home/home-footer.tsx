"use client";

import { useTranslations, useLocale } from "next-intl";
import { Logo } from "@/components/layout/logo";
import { Users, Briefcase, Medal, TreePine } from "lucide-react";
import { useSiteData } from "@/components/layout/site-data-context";
import { SocialLinksRow } from "@/components/layout/social-links-row";

const stats = [
  { value: "250+", key: "clients", icon: Users },
  { value: "1200+", key: "projects", icon: Briefcase },
  { value: "10+", key: "years", icon: Medal },
  { value: "100%", key: "sustainable", icon: TreePine },
] as const;

export function HomeFooter() {
  const t = useTranslations("stats");
  const footer = useTranslations("footer");
  const hero = useTranslations("hero");
  const locale = useLocale();
  const { socialLinks } = useSiteData();

  return (
    <footer className="border-t border-border bg-[#050505]">
      <div className="site-container py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.key} className="glass-card flex items-center gap-4 p-5 sm:p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white sm:text-2xl">{stat.value}</div>
                <div className="text-sm text-muted">{t(stat.key)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="site-container flex flex-col items-center gap-6 py-10 text-center md:flex-row md:justify-between md:text-start">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Logo variant="compact" className="h-9" />
            <p className="tagline">{hero("tagline")}</p>
            <p className="max-w-xs text-sm text-muted">{footer("description")}</p>
          </div>
          <SocialLinksRow
            links={socialLinks}
            locale={locale}
            className="justify-center md:justify-end"
            iconClassName="h-9 w-9 hover:border-brand-green hover:text-brand-green"
          />
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted">
        <div className="site-container">
          &copy; {new Date().getFullYear()} AM CNC WOOD DESIGN. {footer("rights")}.
        </div>
      </div>
    </footer>
  );
}
