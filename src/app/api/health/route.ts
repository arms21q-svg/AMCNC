import { NextResponse } from "next/server";
import { checkProductionEnv } from "@/lib/env-check";

export async function GET() {
  const env = checkProductionEnv();

  return NextResponse.json({
    status: env.ok ? "ok" : "misconfigured",
    ...(env.ok ? {} : { missing: env.missing, hints: env.hints }),
    timestamp: new Date().toISOString(),
  });
}
