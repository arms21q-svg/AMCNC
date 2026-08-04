"use client";

import { usePathname } from "@/i18n/navigation";
import { Footer } from "./footer";
import { BackToTop } from "./back-to-top";
import { FloatingContactButton } from "./floating-contact-button";

export function LayoutExtras() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <>
      <FloatingContactButton />
      {!isHome && (
        <>
          <Footer />
          <BackToTop />
        </>
      )}
    </>
  );
}
