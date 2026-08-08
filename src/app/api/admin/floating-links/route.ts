import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";
import { fetchAllFloatingLinksAdmin } from "@/lib/floating-links.server";

const linkSchema = z.object({
  labelAr: z.string().min(1),
  labelEn: z.string().min(1),
  url: z.string().min(1),
  icon: z.string().default("link"),
  color: z.string().default("green"),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
  openInNewTab: z.boolean().default(true),
});

export async function GET() {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const links = await fetchAllFloatingLinksAdmin();
  return NextResponse.json({ links });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = linkSchema.parse(await request.json());
    const link = await prisma.floatingLink.create({ data: body });
    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
