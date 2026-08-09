import "server-only";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";

import type { AdminListQuery } from "@/lib/admin-query";

export type ServiceItem = Awaited<
  ReturnType<typeof getAllServicesAdmin>
>[number];

export async function getAllServicesAdmin() {
  return safeDbQuery(
    () => prisma.service.findMany({ orderBy: { order: "asc" } }),
    [],
    "admin-services"
  );
}

export async function getAdminStats() {
  return safeDbQuery(
    async () => {
      const [projects, services, messages, users, newMessages] = await Promise.all([
        prisma.project.count(),
        prisma.service.count(),
        prisma.message.count(),
        prisma.user.count(),
        prisma.message.count({ where: { status: "NEW" } }),
      ]);
      return { projects, services, messages, users, newMessages };
    },
    { projects: 0, services: 0, messages: 0, users: 0, newMessages: 0 },
    "admin-stats"
  );
}

export async function getRecentMessagesAdmin(limit = 5) {
  return safeDbQuery(
    () =>
      prisma.message.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        select: {
          id: true,
          name: true,
          subject: true,
          message: true,
          status: true,
          createdAt: true,
        },
      }),
    [],
    "admin-recent-messages"
  );
}

export async function getMessagesAdminPaginated(query: AdminListQuery) {
  const where = query.q
    ? {
        OR: [
          { name: { contains: query.q, mode: "insensitive" as const } },
          { email: { contains: query.q, mode: "insensitive" as const } },
          { subject: { contains: query.q, mode: "insensitive" as const } },
          { message: { contains: query.q, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  return safeDbQuery(
    async () => {
      const [items, total] = await Promise.all([
        prisma.message.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip: query.skip,
          take: query.limit,
        }),
        prisma.message.count({ where }),
      ]);
      return { items, total };
    },
    { items: [], total: 0 },
    "admin-messages-paged"
  );
}

export async function getAllMessagesAdmin() {
  return safeDbQuery(
    () =>
      prisma.message.findMany({
        orderBy: { createdAt: "desc" },
      }),
    [],
    "admin-messages"
  );
}
