import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import { getAllSocialLinksAdmin } from "@/lib/social-links.server";

const linkSchema = z.object({
  platform: z.string().min(1).max(50),
  url: z.string().url().max(500),
  icon: z.string().max(50).optional(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await getAllSocialLinksAdmin();
  return NextResponse.json({ links });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = linkSchema.parse(await request.json());
    const link = await prisma.socialLink.create({
      data: {
        platform: body.platform,
        url: body.url,
        icon: body.icon || body.platform,
        order: body.order,
        active: body.active,
      },
    });
    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
