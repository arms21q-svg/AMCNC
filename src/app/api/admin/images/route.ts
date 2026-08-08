import { NextRequest, NextResponse } from "next/server";
import { getAdminOr401 } from "@/lib/require-admin";
import { listLibraryImagesPaginated } from "@/lib/images.server";
import { buildListMeta, parseAdminListQuery } from "@/lib/admin-query";

export async function GET(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const query = parseAdminListQuery(request.nextUrl.searchParams, 24);
  const { items, total } = await listLibraryImagesPaginated(query);

  return NextResponse.json({
    images: items,
    meta: buildListMeta(total, query.page, query.limit),
  });
}
