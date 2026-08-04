import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(date: Date | string, locale: string): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function getLocalizedField(
  item: object,
  field: string,
  locale: string
): string {
  const record = item as Record<string, unknown>;
  const key = locale === "ar" ? `${field}Ar` : `${field}En`;
  const value = record[key];
  if (typeof value === "string") return value;
  const fallback = record[`${field}En`];
  return typeof fallback === "string" ? fallback : "";
}
