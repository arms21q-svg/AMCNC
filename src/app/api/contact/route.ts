import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createUniqueOrderNumber } from "@/lib/orders.server";
import { safeDbQuery } from "@/lib/safe-db";

const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional(),
  subject: z.string().max(200).optional(),
  message: z.string().min(10).max(5000),
  itemsSummary: z.string().max(500).optional(),
  address: z.string().max(500).optional(),
  quantity: z.coerce.number().int().min(1).max(9999).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`contact:${ip}`, 5, 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: rate.retryAfterSec
          ? { "Retry-After": String(rate.retryAfterSec) }
          : undefined,
      }
    );
  }

  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    const orderNumber = await createUniqueOrderNumber();

    const created = await safeDbQuery(
      () =>
        prisma.message.create({
          data: {
            orderNumber,
            name: data.name,
            email: data.email,
            phone: data.phone,
            subject: data.subject,
            message: data.message,
            itemsSummary: data.itemsSummary?.trim() || null,
            address: data.address?.trim() || null,
            quantity: data.quantity ?? null,
          },
        }),
      null,
      "contact-message"
    );

    if (!created) {
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try WhatsApp." },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
