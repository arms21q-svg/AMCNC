import { NextResponse } from "next/server";
import {
  checkAuthEnv,
  checkProductionEnv,
  getConfiguredEnvSummary,
} from "@/lib/env-check";
import { getStorageSetupError, probeStorageBucket } from "@/lib/storage.server";
import { isPrismaSchemaMissingError } from "@/lib/prisma-errors";
import { prisma } from "@/lib/prisma";

async function getDatabaseStats() {
  try {
    const [projects, published, users] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { published: true } }),
      prisma.user.count(),
    ]);
    return { projects, published, users, connected: true as const, schemaReady: true as const };
  } catch (error) {
    const schemaMissing = isPrismaSchemaMissingError(error);
    return {
      projects: 0,
      published: 0,
      users: 0,
      connected: !schemaMissing,
      schemaReady: false as const,
      schemaError: schemaMissing
        ? "Run prisma migrate deploy on this Supabase database"
        : undefined,
    };
  }
}

export async function GET() {
  const auth = checkAuthEnv();
  const full = checkProductionEnv();
  const database = auth.ok ? await getDatabaseStats() : undefined;
  const configured = getConfiguredEnvSummary();
  const storageError = auth.ok ? getStorageSetupError() : null;
  const storageProbe = auth.ok && !storageError ? await probeStorageBucket() : null;

  return NextResponse.json({
    status: auth.ok ? "ok" : "misconfigured",
    auth: auth.ok ? "ready" : { missing: auth.missing, hints: auth.hints },
    warnings: "warnings" in full ? full.warnings : [],
    configured,
    database,
    storage: auth.ok
      ? {
          ready: !storageError && (storageProbe?.ok ?? false),
          bucket: configured.storageBucket,
          error: storageError ?? (storageProbe && !storageProbe.ok ? storageProbe.error : null),
          code: storageProbe && !storageProbe.ok ? storageProbe.code : null,
        }
      : undefined,
    timestamp: new Date().toISOString(),
  });
}
