import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";

const updateSchema = z.object({
  status: z.enum(["NEW", "READ", "REPLIED"]).optional(),
  deliveryStatus: z
    .enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"])
    .optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const { id } = await params;

  try {
    const body = updateSchema.parse(await request.json());
    if (!body.status && !body.deliveryStatus) {
      return NextResponse.json({ error: "No updates provided" }, { status: 400 });
    }

    const message = await prisma.message.update({
      where: { id },
      data: {
        ...(body.status ? { status: body.status } : {}),
        ...(body.deliveryStatus ? { deliveryStatus: body.deliveryStatus } : {}),
      },
    });
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
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
    await prisma.message.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
