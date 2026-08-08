import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyToken, type AdminPayload } from "@/lib/auth";

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Returns admin payload or a 401 NextResponse — use with `instanceof NextResponse`. */
export async function getAdminOr401(): Promise<AdminPayload | NextResponse> {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return admin;
}
