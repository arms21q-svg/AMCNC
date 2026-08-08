import { NextResponse } from "next/server";
import {
  checkAuthEnv,
  checkProductionEnv,
  getConfiguredEnvSummary,
} from "@/lib/env-check";
import { getStorageSetupError } from "@/lib/storage.server";
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
  const configured = getConfiguredEnvSummary();
  const storageError = auth.ok ? getStorageSetupError() : null;

  return NextResponse.json({
    status: auth.ok ? "ok" : "misconfigured",
    auth: auth.ok ? "ready" : { missing: auth.missing, hints: auth.hints },
    warnings: "warnings" in full ? full.warnings : [],
    configured,
    database,
    storage: auth.ok
      ? {
          ready: !storageError,
          bucket: configured.storageBucket,
          error: storageError,
        }
      : undefined,
    timestamp: new Date().toISOString(),
  });
}
