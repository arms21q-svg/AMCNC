import "server-only";

type PrismaErrorLike = {
  code?: string;
  message?: string;
  meta?: { modelName?: string; table?: string };
};

export function isPrismaError(error: unknown): error is PrismaErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as PrismaErrorLike).code === "string"
  );
}

/** Schema/tables missing — database not migrated yet. */
export function isPrismaSchemaMissingError(error: unknown): boolean {
  if (!isPrismaError(error)) {
    return /does not exist|relation .* does not exist|P2021|P2022/i.test(
      error instanceof Error ? error.message : String(error)
    );
  }
  return error.code === "P2021" || error.code === "P2022";
}

export function prismaSchemaMissingMessage(): string {
  return "Database schema is not initialized. Run: npm run db:migrate:deploy && npm run db:seed";
}

export function prismaSchemaMissingPublicMessage(): string {
  return "قاعدة البيانات غير مهيأة — شغّل db:migrate:deploy ثم db:seed على Supabase";
}

export function mapPrismaApiError(error: unknown): {
  status: number;
  code: string;
  error: string;
  hint?: string;
} {
  if (isPrismaSchemaMissingError(error)) {
    return {
      status: 503,
      code: "DB_SCHEMA_MISSING",
      error: prismaSchemaMissingPublicMessage(),
      hint: "Apply prisma/migrations on the Supabase database (npm run db:migrate:deploy).",
    };
  }

  if (isPrismaError(error) && error.code === "P2002") {
    return {
      status: 409,
      code: "DB_UNIQUE_VIOLATION",
      error: "قيمة مكررة — السجل موجود مسبقاً",
    };
  }

  if (isPrismaError(error) && error.code === "P2025") {
    return {
      status: 404,
      code: "DB_NOT_FOUND",
      error: "السجل غير موجود",
    };
  }

  const message = error instanceof Error ? error.message : "Database error";
  if (/timeout|ECONNREFUSED|Can't reach database|Connection terminated/i.test(message)) {
    return {
      status: 503,
      code: "DB_CONNECTION_FAILED",
      error: "فشل الاتصال بقاعدة البيانات",
      hint: "Check DATABASE_URL and DIRECT_URL on Vercel (Supabase pooler port 5432/6543).",
    };
  }

  return {
    status: 500,
    code: "DB_ERROR",
    error:
      process.env.NODE_ENV === "production"
        ? "خطأ في قاعدة البيانات"
        : message,
  };
}

export function prismaErrorResponse(error: unknown) {
  const mapped = mapPrismaApiError(error);
  return Response.json(
    {
      error: mapped.error,
      code: mapped.code,
      ...(mapped.hint ? { hint: mapped.hint } : {}),
    },
    { status: mapped.status }
  );
}
