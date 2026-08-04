"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import {
  buildWhatsAppUrl,
  getDefaultWhatsAppMessage,
} from "@/lib/whatsapp";
import { parseJsonResponse } from "@/lib/parse-json-response";

export function useWhatsAppUrl() {
  const locale = useLocale();
  const fallback = buildWhatsAppUrl(undefined, getDefaultWhatsAppMessage(locale));
  const [url, setUrl] = useState(fallback);

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const res = await fetch("/api/floating-links");
        const data = await parseJsonResponse<{
          links?: Array<{ icon: string; url: string; active: boolean }>;
        }>(res);
        const whatsapp = data.links?.find(
          (link) => link.active && link.icon === "whatsapp"
        );
        if (active && whatsapp?.url) {
          setUrl(whatsapp.url);
        }
      } catch {
        // keep fallback
      }
    })();

    return () => {
      active = false;
    };
  }, [locale]);

  return url;
}
