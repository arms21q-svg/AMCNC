import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";

const linkSchema = z.object({
  platform: z.string().min(1).max(50),
  url: z.string().url().max(500),
  icon: z.string().max(50).optional().nullable(),
  order: z.number().int(),
  active: z.boolean(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  try {
    const body = linkSchema.parse(await request.json());
    const link = await prisma.socialLink.update({
      where: { id },
      data: {
        platform: body.platform,
        url: body.url,
        icon: body.icon || body.platform,
        order: body.order,
        active: body.active,
      },
    });
    return NextResponse.json({ link });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  try {
    await prisma.socialLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
