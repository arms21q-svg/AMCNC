import { NextResponse } from "next/server";
import {
  checkAuthEnv,
  checkProductionEnv,
  getConfiguredEnvSummary,
} from "@/lib/env-check";

export async function GET() {
  const auth = checkAuthEnv();
  const full = checkProductionEnv();

  return NextResponse.json({
    status: auth.ok ? "ok" : "misconfigured",
    auth: auth.ok ? "ready" : { missing: auth.missing, hints: auth.hints },
    warnings: "warnings" in full ? full.warnings : [],
    configured: getConfiguredEnvSummary(),
    timestamp: new Date().toISOString(),
  });
}
