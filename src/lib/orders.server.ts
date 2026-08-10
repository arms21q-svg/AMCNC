import "server-only";
import { prisma } from "@/lib/prisma";

export function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `AM-${y}${m}${d}-${rand}`;
}

export async function createUniqueOrderNumber() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const orderNumber = generateOrderNumber();
    const exists = await prisma.message.findUnique({
      where: { orderNumber },
      select: { id: true },
    });
    if (!exists) return orderNumber;
  }
  return `${generateOrderNumber()}-${Date.now().toString(36).slice(-4)}`;
}
