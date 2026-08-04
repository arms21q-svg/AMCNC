import { NextResponse } from "next/server";
import { getHomepageContent } from "@/lib/site-settings.server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "ar";
  const content = await getHomepageContent(locale);
  return NextResponse.json({ content });
}
