"use client";

import { useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { ErrorState } from "@/components/ui/state-message";
import { Button } from "@/components/ui/button";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[locale/error]", error);
    }
  }, [error]);

  return (
    <div className="site-container section-padding">
      <ErrorState
        title="تعذر تحميل الصفحة"
        description="حدث خطأ مؤقت. يمكنك إعادة المحاولة أو العودة للرئيسية."
        onAction={reset}
      />
      <div className="mt-6 flex justify-center">
        <Button variant="ghost" asChild>
          <Link href="/">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
}
