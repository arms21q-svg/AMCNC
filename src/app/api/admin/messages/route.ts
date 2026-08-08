import { NextRequest, NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { getMessagesAdminPaginated } from "@/lib/services.server";
import { buildListMeta, parseAdminListQuery } from "@/lib/admin-query";

export async function GET(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const query = parseAdminListQuery(request.nextUrl.searchParams);
  const { items, total } = await getMessagesAdminPaginated(query);

  return NextResponse.json({
    messages: items,
    meta: buildListMeta(total, query.page, query.limit),
  });
}
