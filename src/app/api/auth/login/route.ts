import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { comparePassword, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { checkAuthEnv, formatEnvCheckError } from "@/lib/env-check";
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

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const envCheck = checkAuthEnv();
  if (!envCheck.ok) {
    return NextResponse.json(
      { error: formatEnvCheckError(envCheck), missing: envCheck.missing },
      { status: 503 }
    );
  }

  const ip = getClientIp(request);
  const rate = checkRateLimit(`login:${ip}`, 10, 15 * 60_000);

  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.active) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await signToken({
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    response.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const message =
      error instanceof Error ? error.message : "Internal server error";
    const isProd = process.env.NODE_ENV === "production";

    if (/JWT_SECRET|DATABASE_URL|DIRECT_URL|required/i.test(message)) {
      return NextResponse.json(
        {
          error: isProd
            ? "Server configuration error. Check DATABASE_URL and JWT_SECRET on Vercel."
            : message,
        },
        { status: 500 }
      );
    }

    if (/timeout|ECONNREFUSED|Can't reach database|Connection terminated/i.test(message)) {
      return NextResponse.json(
        {
          error: isProd
            ? "Database connection failed. Check Supabase and env vars."
            : "Database connection failed. Check DIRECT_URL (port 5432) and run npm run db:seed.",
        },
        { status: 500 }
      );
    }

    console.error("[auth/login]", error);

    const prismaMapped = mapPrismaApiError(error);
    if (prismaMapped.code !== "DB_ERROR" || prismaMapped.status !== 500) {
      return NextResponse.json(
        {
          error: prismaMapped.error,
          code: prismaMapped.code,
          ...(prismaMapped.hint ? { hint: prismaMapped.hint } : {}),
        },
        { status: prismaMapped.status }
      );
    }

    return NextResponse.json(
      { error: isProd ? "Internal server error" : message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
