import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";

const linkSchema = z.object({
  labelAr: z.string().min(1),
  labelEn: z.string().min(1),
  url: z.string().min(1),
  icon: z.string(),
  color: z.string(),
  order: z.number().int(),
  active: z.boolean(),
  openInNewTab: z.boolean(),
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
    const link = await prisma.floatingLink.update({
      where: { id },
      data: body,
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
    await prisma.floatingLink.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
