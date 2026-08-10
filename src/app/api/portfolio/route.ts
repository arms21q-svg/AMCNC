import { NextRequest, NextResponse } from "next/server";
import { getPublishedProjectsPaginated } from "@/lib/projects.server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = Math.min(24, Math.max(1, Number(searchParams.get("limit") || 12)));
  const category = searchParams.get("category") || undefined;
  const q = searchParams.get("q")?.trim() || undefined;

  const data = await getPublishedProjectsPaginated({ page, limit, category, q });

  const response = NextResponse.json(data);
  response.headers.set("Cache-Control", "public, s-maxage=120, stale-while-revalidate=600");
  return response;
}
