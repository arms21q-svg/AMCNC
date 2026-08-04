"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/hero-slides";

const SLIDE_INTERVAL_MS = 3000;

interface HeroSliderProps {
  locale: string;
  slides: HeroSlide[];
  className?: string;
}

export function HeroSlider({ locale, slides, className }: HeroSliderProps) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const slideCount = slides.length;

  const next = useCallback(() => {
    setActive((current) => (current + 1) % slideCount);
  }, [slideCount]);

  useEffect(() => {
    if (paused || slideCount <= 1) return;
    const timer = setInterval(next, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next, paused, slideCount]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPaused(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  if (slideCount === 0) return null;

  return (
    <div
      className={cn("absolute inset-0 overflow-hidden", className)}
      aria-hidden
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((slide, index) => {
        const isActive = index === active;
        return (
          <motion.div
            key={`${slide.src}-${index}`}
            initial={false}
            animate={{
              opacity: isActive ? 1 : 0,
              scale: isActive ? 1 : 1.06,
            }}
            transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={slide.src}
              alt={locale === "ar" ? slide.altAr : slide.altEn}
              fill
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="100vw"
              className="object-cover object-center"
              unoptimized={slide.src.startsWith("/uploads/")}
            />
          </motion.div>
        );
      })}

      <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(132,204,22,0.18)_0%,transparent_60%)]" />

      {slideCount > 1 && (
        <div className="absolute bottom-6 left-1/2 z-[2] flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={`dot-${slide.src}-${index}`}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => setActive(index)}
              className="group relative h-1.5 overflow-hidden rounded-full bg-white/20 transition-all hover:bg-white/30"
              style={{ width: index === active ? "2.5rem" : "1.5rem" }}
            >
              {index === active && !paused && (
                <motion.span
                  key={`progress-${active}`}
                  className="absolute inset-y-0 start-0 rounded-full bg-brand-green"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: "linear" }}
                />
              )}
              {index === active && paused && (
                <span className="absolute inset-0 rounded-full bg-brand-green" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
