"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Menu, X, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { Logo } from "./logo";
import { WhatsAppLink } from "@/components/ui/whatsapp-link";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/services", key: "services" },
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
      <div className="site-container flex h-14 items-center justify-between gap-2 sm:h-16 sm:gap-3">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          {!isHome && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 lg:hidden"
              onClick={() => router.back()}
              aria-label={tCommon("back")}
            >
              <BackIcon className="h-5 w-5" />
            </Button>
          )}
          <Link href="/" className="shrink-0">
            <Logo variant="header" priority className="h-9 sm:h-10" />
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          <WhatsAppLink className="inline-flex items-center justify-center rounded-md bg-brand-green px-2 py-1 text-[10px] font-semibold leading-tight text-black transition-all hover:bg-brand-green-light whitespace-nowrap sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-[11px] lg:gap-1.5 lg:rounded-xl lg:px-4 lg:py-2 lg:text-xs">
            {t("requestQuote")}
            <Arrow className="hidden h-3.5 w-3.5 lg:block" />
          </WhatsAppLink>
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={toggleMobileMenu}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
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
                  "rounded-lg px-3 py-2.5 text-sm font-medium",
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
