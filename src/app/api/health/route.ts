import { NextResponse } from "next/server";
import {
  checkAuthEnv,
  checkProductionEnv,
  getConfiguredEnvSummary,
} from "@/lib/env-check";
import { prisma } from "@/lib/prisma";

async function getDatabaseStats() {
  try {
    const [projects, published, users] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { published: true } }),
      prisma.user.count(),
    ]);
    return { projects, published, users, connected: true as const };
  } catch {
    return { projects: 0, published: 0, users: 0, connected: false as const };
  }
}

export async function GET() {
  const auth = checkAuthEnv();
  const full = checkProductionEnv();
  const database = auth.ok ? await getDatabaseStats() : undefined;

  return NextResponse.json({
    status: auth.ok ? "ok" : "misconfigured",
    auth: auth.ok ? "ready" : { missing: auth.missing, hints: auth.hints },
    warnings: "warnings" in full ? full.warnings : [],
    configured: getConfiguredEnvSummary(),
    database,
    timestamp: new Date().toISOString(),
  });
}
