import { NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { getActiveCategories } from "@/lib/projects.server";

export async function GET() {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const categories = await getActiveCategories();
  return NextResponse.json({ categories });
}
