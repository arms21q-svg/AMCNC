import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { getMessagesAdminPaginated } from "@/lib/services.server";
import { buildListMeta, parseAdminListQuery } from "@/lib/admin-query";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = parseAdminListQuery(request.nextUrl.searchParams);
  const { items, total } = await getMessagesAdminPaginated(query);

  return NextResponse.json({
    messages: items,
    meta: buildListMeta(total, query.page, query.limit),
  });
}
