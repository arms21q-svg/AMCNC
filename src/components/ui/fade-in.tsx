"use client";

import { motion, type HTMLMotionProps, type TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";

type FadeInVariant = "up" | "left" | "scale";

const VARIANTS: Record<FadeInVariant, { visible: TargetAndTransition }> = {
  up: { visible: { opacity: 1, y: 0 } },
  left: { visible: { opacity: 1, x: 0 } },
  scale: { visible: { opacity: 1, scale: 1 } },
};

type FadeInProps = HTMLMotionProps<"div"> & {
  variant?: FadeInVariant;
  delay?: number;
  inView?: boolean;
};

/** SSR-safe fade — avoids flash-then-hide on hydration. */
export function FadeIn({
  variant = "up",
  delay = 0,
  inView = false,
  className,
  children,
  ...props
}: FadeInProps) {
  const motionProps = inView
    ? {
        initial: false as const,
        whileInView: VARIANTS[variant].visible,
        viewport: { once: true },
      }
    : {
        initial: false as const,
        animate: VARIANTS[variant].visible,
      };

  return (
    <motion.div
      {...motionProps}
      transition={{ delay, duration: 0.4 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
