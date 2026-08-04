import "server-only";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";

export type SocialLinkItem = {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  order: number;
  active: boolean;
};

export async function getActiveSocialLinks(): Promise<SocialLinkItem[]> {
  return safeDbQuery(
    () =>
      prisma.socialLink.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          platform: true,
          url: true,
          icon: true,
          order: true,
          active: true,
        },
      }),
    [],
    "social-links"
  );
}

export async function getAllSocialLinksAdmin(): Promise<SocialLinkItem[]> {
  return safeDbQuery(
    () =>
      prisma.socialLink.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          platform: true,
          url: true,
          icon: true,
          order: true,
          active: true,
        },
      }),
    [],
    "admin-social-links"
  );
}
