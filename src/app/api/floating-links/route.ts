import { NextResponse } from "next/server";
import { fetchFloatingLinks } from "@/lib/floating-links.server";

export async function GET() {
  try {
    const links = await fetchFloatingLinks();
    return NextResponse.json({ links });
  } catch {
    const { getDefaultFloatingLinks } = await import("@/lib/floating-links-defaults");
    return NextResponse.json({ links: getDefaultFloatingLinks() });
  }
}
