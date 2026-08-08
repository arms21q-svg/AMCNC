import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminOr401 } from "@/lib/require-admin";
import {
  comparePassword,
  hashPassword,
  signToken,
  type AdminPayload,
} from "@/lib/auth";
import { mapPrismaApiError } from "@/lib/prisma-errors";

const ADMIN_COOKIE = "admin-token";
const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: ADMIN_COOKIE_MAX_AGE,
    path: "/",
  };
}

const updateAccountSchema = z
  .object({
    currentPassword: z.string().min(6),
    email: z.string().email().optional(),
    newPassword: z.string().min(6).optional(),
    confirmPassword: z.string().min(6).optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && data.newPassword !== data.confirmPassword) {
        return false;
      }
      return Boolean(data.email || data.newPassword);
    },
    {
      message: "Provide email or new password",
      path: ["confirmPassword"],
    }
  );

export async function GET() {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const user = await prisma.user.findUnique({
      where: { id: admin.id },
      select: { id: true, email: true, name: true, role: true, active: true },
    });

    if (!user || !user.active) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    const mapped = mapPrismaApiError(error);
    return NextResponse.json(
      { error: mapped.error, code: mapped.code },
      { status: mapped.status }
    );
  }
}

export async function PUT(request: NextRequest) {
  const admin = await getAdminOr401();
  if (admin instanceof NextResponse) return admin;

  try {
    const body = updateAccountSchema.parse(await request.json());

    const user = await prisma.user.findUnique({ where: { id: admin.id } });
    if (!user || !user.active) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const valid = await comparePassword(body.currentPassword, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: "كلمة المرور الحالية غير صحيحة", code: "INVALID_PASSWORD" },
        { status: 400 }
      );
    }

    const nextEmail = body.email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== user.email) {
      const existing = await prisma.user.findUnique({
        where: { email: nextEmail },
      });
      if (existing && existing.id !== user.id) {
        return NextResponse.json(
          { error: "البريد الإلكتروني مستخدم بالفعل", code: "EMAIL_TAKEN" },
          { status: 409 }
        );
      }
    }

    const data: { email?: string; password?: string } = {};
    if (nextEmail && nextEmail !== user.email) {
      data.email = nextEmail;
    }
    if (body.newPassword) {
      data.password = await hashPassword(body.newPassword);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "لا توجد تغييرات للحفظ", code: "NO_CHANGES" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, email: true, name: true, role: true },
    });

    const tokenPayload: AdminPayload = {
      id: updated.id,
      email: updated.email,
      name: updated.name || "",
      role: updated.role,
    };

    const token = await signToken(tokenPayload);
    const response = NextResponse.json({
      success: true,
      user: updated,
      message: "تم تحديث الحساب بنجاح",
    });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const mismatch = error.issues.some((issue) =>
        issue.path.includes("confirmPassword")
      );
      return NextResponse.json(
        {
          error: mismatch
            ? "كلمة المرور الجديدة غير متطابقة"
            : "بيانات غير صالحة",
          code: "VALIDATION_FAILED",
        },
        { status: 400 }
      );
    }

    const mapped = mapPrismaApiError(error);
    return NextResponse.json(
      { error: mapped.error, code: mapped.code },
      { status: mapped.status }
    );
  }
}
