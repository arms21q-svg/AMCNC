import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { seedDemoData } from "@/lib/seed-demo.server";

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await seedDemoData();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[seed-demo]", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
