"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Menu, X, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/portfolio", key: "portfolio" },
  { href: "/contact", key: "contact" },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const mobileOpen = mobileMenuPath === pathname;
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;
  const BackIcon = locale === "ar" ? ChevronRight : ChevronLeft;
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuPath(mobileOpen ? null : pathname);
  };

  const closeMobileMenu = () => setMobileMenuPath(null);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border bg-header backdrop-blur-xl"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="site-container flex h-16 items-center justify-between gap-2 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          {!isHome && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 lg:hidden"
              onClick={() => router.back()}
              aria-label={tCommon("back")}
            >
              <BackIcon className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="shrink-0">
            <Logo variant="header" priority className="h-10 sm:h-11" />
          </Link>
        </div>

        <nav className="hidden items-center gap-1 rounded-xl border border-border bg-card/50 p-1 backdrop-blur-md lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              prefetch={pathname === item.href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-brand-green/10 text-brand-green"
                  : "text-muted hover:text-white"
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <WhatsAppLink
            aria-label={t("requestQuote")}
            className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg bg-brand-green text-black transition-all hover:bg-brand-green-light sm:min-h-[44px] sm:min-w-0 sm:gap-1.5 sm:px-3 sm:py-2 lg:rounded-xl lg:px-4 lg:py-2.5"
          >
            <MessageCircle className="h-4 w-4 sm:hidden" strokeWidth={2.25} />
            <span className="hidden text-xs font-semibold leading-snug sm:inline lg:text-sm">
              {t("requestQuote")}
            </span>
            <Arrow className="hidden h-3.5 w-3.5 lg:block" />
          </WhatsAppLink>
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="border-t border-border bg-header backdrop-blur-xl lg:hidden">
          <div className="site-container flex flex-col gap-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                prefetch={pathname === item.href}
                onClick={closeMobileMenu}
                className={cn(
                  "flex min-h-[48px] items-center rounded-lg px-4 py-3 text-base font-medium",
                  pathname === item.href
                    ? "bg-brand-green/10 text-brand-green"
                    : "text-muted hover:text-white"
                )}
              >
                {t(item.key)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
