import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getActiveCategories } from "@/lib/projects.server";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await getActiveCategories();
  return NextResponse.json({ categories });
}
