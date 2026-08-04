import { NextResponse } from "next/server";
import { getActiveSocialLinks } from "@/lib/social-links.server";

export async function GET() {
  const links = await getActiveSocialLinks();
  return NextResponse.json(
    { links },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
