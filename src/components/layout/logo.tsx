"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { BRAND_LOGO, BRAND_NAME, BRAND_TAGLINE } from "@/lib/brand";

interface LogoProps {
  className?: string;
  variant?: "full" | "compact" | "header";
  priority?: boolean;
}

export function Logo({ className, variant = "full", priority = false }: LogoProps) {
  const loading = priority ? "eager" : "lazy";

  if (variant === "header") {
    return (
      <Image
        src={BRAND_LOGO}
        alt={BRAND_NAME}
        width={280}
        height={80}
        className={cn("h-9 w-auto sm:h-10 md:h-11 object-contain", className)}
        priority={priority}
        loading={loading}
      />
    );
  }

  if (variant === "compact") {
    return (
      <Image
        src={BRAND_LOGO}
        alt={BRAND_NAME}
        width={240}
        height={70}
        className={cn("h-10 w-auto md:h-12 object-contain", className)}
        priority={priority}
        loading={loading}
      />
    );
  }

  return (
    <Image
      src={BRAND_LOGO}
      alt={`${BRAND_NAME} - ${BRAND_TAGLINE}`}
      width={480}
      height={160}
      className={cn("h-28 w-auto sm:h-32 md:h-36 object-contain", className)}
      priority={priority}
      loading={loading}
    />
  );
}
