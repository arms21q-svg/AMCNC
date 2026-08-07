import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { listLibraryImagesPaginated } from "@/lib/images.server";
import { buildListMeta, parseAdminListQuery } from "@/lib/admin-query";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = parseAdminListQuery(request.nextUrl.searchParams, 24);
  const { items, total } = await listLibraryImagesPaginated(query);

  return NextResponse.json({
    images: items,
    meta: buildListMeta(total, query.page, query.limit),
  });
}
