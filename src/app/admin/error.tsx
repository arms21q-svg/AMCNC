"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/state-message";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[admin/error]", error);
    }
  }, [error]);

  return (
    <div className="dark min-h-screen bg-background p-6">
      <ErrorState
        title="خطأ في لوحة التحكم"
        description="حدث خطأ أثناء تحميل هذه الصفحة."
        onAction={reset}
      />
      <div className="mt-6 flex justify-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">لوحة التحكم</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/login">تسجيل الدخول</Link>
        </Button>
      </div>
    </div>
  );
}
