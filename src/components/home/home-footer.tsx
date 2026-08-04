"use client";

import { useTranslations } from "next-intl";
import { Logo } from "@/components/layout/logo";
import { Users, Briefcase, Medal, TreePine } from "lucide-react";

const stats = [
  { value: "250+", key: "clients", icon: Users },
  { value: "1200+", key: "projects", icon: Briefcase },
  { value: "10+", key: "years", icon: Medal },
  { value: "100%", key: "sustainable", icon: TreePine },
] as const;

const socialLinks = [
  { name: "Instagram", href: "https://instagram.com", label: "Ig" },
  { name: "Facebook", href: "https://facebook.com", label: "Fb" },
  { name: "YouTube", href: "https://youtube.com", label: "Yt" },
];

export function HomeFooter() {
  const t = useTranslations("stats");
  const footer = useTranslations("footer");
  const hero = useTranslations("hero");

  return (
    <footer className="border-t border-border bg-[#050505]">
      <div className="site-container py-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.key} className="glass-card flex items-center gap-3 p-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-green/10 text-brand-green">
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-muted">{t(stat.key)}</div>
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
            <p className="max-w-xs text-xs text-muted">{footer("description")}</p>
          </div>
          <div className="flex gap-3">
            {socialLinks.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.name}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-xs text-muted transition-colors hover:border-brand-green hover:text-brand-green"
              >
                {s.label}
              </a>
            ))}
          </div>
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
