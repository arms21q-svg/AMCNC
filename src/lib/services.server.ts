import "server-only";
import { prisma } from "@/lib/prisma";
import { safeDbQuery } from "@/lib/safe-db";

export type ServiceItem = Awaited<
  ReturnType<typeof getActiveServices>
>[number];

export async function getActiveServices() {
  return safeDbQuery(
    () =>
      prisma.service.findMany({
        where: { active: true },
        orderBy: { order: "asc" },
      }),
    [],
    "services"
  );
}

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
      const [projects, services, messages, users] = await Promise.all([
        prisma.project.count(),
        prisma.service.count(),
        prisma.message.count(),
        prisma.user.count(),
      ]);
      return { projects, services, messages, users };
    },
    { projects: 0, services: 0, messages: 0, users: 0 },
    "admin-stats"
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
