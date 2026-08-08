import { NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { seedDemoData } from "@/lib/seed-demo.server";

export async function POST() {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const result = await seedDemoData();
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("[seed-demo]", error);
    return NextResponse.json({ error: "Seed failed" }, { status: 500 });
  }
}
