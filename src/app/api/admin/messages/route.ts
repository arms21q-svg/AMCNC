import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getAllMessagesAdmin } from "@/lib/services.server";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const messages = await getAllMessagesAdmin();
  return NextResponse.json({ messages });
}
