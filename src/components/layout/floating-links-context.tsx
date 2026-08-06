"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import type { FloatingLinkItem } from "@/lib/floating-links-defaults";
import { getDefaultFloatingLinks } from "@/lib/floating-links-defaults";
import {
  buildWhatsAppUrl,
  getDefaultWhatsAppMessage,
} from "@/lib/whatsapp";
import { parseJsonResponse } from "@/lib/parse-json-response";

type FloatingLinksContextValue = {
  links: FloatingLinkItem[];
  whatsappUrl: string;
  loaded: boolean;
};

const FloatingLinksContext = createContext<FloatingLinksContextValue | null>(
  null
);

export function FloatingLinksProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const fallbackWhatsapp = useMemo(
    () => buildWhatsAppUrl(undefined, getDefaultWhatsAppMessage(locale)),
    [locale]
  );
  const [links, setLinks] = useState<FloatingLinkItem[]>(getDefaultFloatingLinks);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          const res = await fetch("/api/floating-links");
          const data = await parseJsonResponse<{ links?: FloatingLinkItem[] }>(
            res
          );
          if (!active) return;

          const nextLinks =
            data.links?.length ? data.links : getDefaultFloatingLinks();
          setLinks(nextLinks);
        } catch {
          if (active) {
            setLinks(getDefaultFloatingLinks());
          }
        } finally {
          if (active) setLoaded(true);
        }
      })();
    });

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  const whatsappUrl = useMemo(() => {
    const whatsapp = links.find(
      (link) => link.active && link.icon === "whatsapp"
    );
    return whatsapp?.url || fallbackWhatsapp;
  }, [links, fallbackWhatsapp]);

  const value = useMemo(
    () => ({ links, whatsappUrl, loaded }),
    [links, whatsappUrl, loaded]
  );

  return (
    <FloatingLinksContext.Provider value={value}>
      {children}
    </FloatingLinksContext.Provider>
  );
}

export function useFloatingLinks() {
  const context = useContext(FloatingLinksContext);
  if (!context) {
    throw new Error("useFloatingLinks must be used within FloatingLinksProvider");
  }
  return context;
}

export function useWhatsAppUrl() {
  return useFloatingLinks().whatsappUrl;
}
