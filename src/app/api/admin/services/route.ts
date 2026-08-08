import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";
import { getAllServicesAdmin } from "@/lib/services.server";

const serviceSchema = z.object({
  slug: z.string().min(1).max(120),
  titleAr: z.string().min(1),
  titleEn: z.string().min(1),
  descriptionAr: z.string().min(1),
  descriptionEn: z.string().min(1),
  icon: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET() {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  const services = await getAllServicesAdmin();
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = serviceSchema.parse(await request.json());
    const service = await prisma.service.create({ data: body });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
