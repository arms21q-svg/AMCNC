import "server-only";
import { prisma } from "@/lib/prisma";
import {
  getDefaultFloatingLinks,
  type FloatingLinkItem,
} from "@/lib/floating-links-defaults";

export type { FloatingLinkItem };

export async function fetchFloatingLinks(): Promise<FloatingLinkItem[]> {
  try {
    const links = await prisma.floatingLink.findMany({
      where: { active: true },
      orderBy: { order: "asc" },
    });
    if (links.length > 0) return links;
  } catch {
    // Database unavailable
  }
  return getDefaultFloatingLinks();
}

export async function fetchAllFloatingLinksAdmin(): Promise<FloatingLinkItem[]> {
  try {
    return await prisma.floatingLink.findMany({ orderBy: { order: "asc" } });
  } catch {
    return [];
  }
}
