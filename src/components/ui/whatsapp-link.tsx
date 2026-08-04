"use client";

import type { ComponentProps } from "react";
import { useWhatsAppUrl } from "@/hooks/use-whatsapp-url";
import { cn } from "@/lib/utils";

type WhatsAppLinkProps = Omit<ComponentProps<"a">, "href" | "target" | "rel">;

export function WhatsAppLink({ className, children, ...props }: WhatsAppLinkProps) {
  const url = useWhatsAppUrl();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className)}
      {...props}
    >
      {children}
    </a>
  );
}
