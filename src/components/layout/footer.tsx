"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./logo";
import { useSiteData } from "./site-data-context";
import { getFloatingIcon } from "@/lib/floating-link-ui";
import { SOCIAL_PLATFORM_LABELS_AR } from "@/lib/admin-labels";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const contactT = useTranslations("contact");
  const hero = useTranslations("hero");
  const locale = useLocale();
  const { contact, socialLinks } = useSiteData();

  const address = locale === "ar" ? contact.addressAr : contact.addressEn;
  const phoneHref = contact.phone.startsWith("+")
    ? `tel:${contact.phone}`
    : `tel:+${contact.phone.replace(/\D/g, "")}`;

  const links = [
    { href: "/", key: "home" },
    { href: "/portfolio", key: "portfolio" },
    { href: "/services", key: "services" },
    { href: "/about", key: "about" },
    { href: "/contact", key: "contact" },
  ] as const;

  return (
    <footer className="bg-footer border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Logo variant="compact" />
            </Link>
            <p className="tagline mb-3">{hero("tagline")}</p>
            <p className="text-sm text-muted leading-relaxed">
              {t("description")}
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted hover:text-brand-green transition-colors"
                  >
                    {nav(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">
              {t("contactInfo")}
            </h3>
            <ul className="space-y-3">
              {address && (
                <li className="flex items-start gap-3 text-sm text-muted">
                  <MapPin className="h-4 w-4 mt-0.5 text-brand-green shrink-0" />
                  {contact.mapsUrl ? (
                    <a
                      href={contact.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-green transition-colors"
                    >
                      {address}
                    </a>
                  ) : (
                    <span>{address}</span>
                  )}
                </li>
              )}
              {contact.phone && (
                <li className="flex items-center gap-3 text-sm text-muted">
                  <Phone className="h-4 w-4 text-brand-green shrink-0" />
                  <a
                    href={phoneHref}
                    className="hover:text-brand-green transition-colors"
                  >
                    {contact.phone}
                  </a>
                </li>
              )}
              {contact.email && (
                <li className="flex items-center gap-3 text-sm text-muted">
                  <Mail className="h-4 w-4 text-brand-green shrink-0" />
                  <a
                    href={`mailto:${contact.email}`}
                    className="hover:text-brand-green transition-colors"
                  >
                    {contact.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">
              {contactT("followUs")}
            </h3>
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => {
                  const Icon = getFloatingIcon(link.icon || link.platform);
                  const label =
                    locale === "ar"
                      ? SOCIAL_PLATFORM_LABELS_AR[link.platform] || link.platform
                      : link.platform;

                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand-gold hover:text-brand-gold"
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted">{contactT("socialLinksHint")}</p>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted">
          <p>
            &copy; {new Date().getFullYear()} AM CNC WOOD DESIGN. {t("rights")}.
          </p>
        </div>
      </div>
    </footer>
  );
}
