import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");
  const contact = useTranslations("contact");
  const hero = useTranslations("hero");

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
              <li className="flex items-start gap-3 text-sm text-muted">
                <MapPin className="h-4 w-4 mt-0.5 text-brand-green shrink-0" />
                <span>Riyadh, Saudi Arabia</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted">
                <Phone className="h-4 w-4 text-brand-green shrink-0" />
                <a href="tel:+966500000000" className="hover:text-brand-green transition-colors">
                  +966 50 000 0000
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted">
                <Mail className="h-4 w-4 text-brand-green shrink-0" />
                <a href="mailto:info@amcncwood.com" className="hover:text-brand-green transition-colors">
                  info@amcncwood.com
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold mb-4">
              {contact("followUs")}
            </h3>
            <div className="flex gap-3">
              {["instagram", "twitter", "facebook", "linkedin"].map((platform) => (
                <a
                  key={platform}
                  href={`https://${platform}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg border border-border flex items-center justify-center text-muted hover:text-brand-gold hover:border-brand-gold transition-colors capitalize text-xs"
                  aria-label={platform}
                >
                  {platform[0].toUpperCase()}
                </a>
              ))}
            </div>
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
