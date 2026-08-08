"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { SetAdminRtl } from "@/components/admin/set-admin-rtl";
import { ADMIN } from "@/lib/admin-labels";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

type HealthResponse = {
  status?: string;
  auth?: { missing?: string[]; hints?: string[] } | string;
};

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [envIssue, setEnvIssue] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/health");
        const data = (await res.json()) as HealthResponse;
        if (data.status === "misconfigured" && typeof data.auth === "object") {
          const missing = data.auth.missing?.join("، ") || "JWT_SECRET / DATABASE_URL";
          setEnvIssue(`إعدادات Vercel ناقصة: ${missing}`);
        }
      } catch {
        // ignore — local dev
      }
    })();
  }, []);

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = (await res.json().catch(() => null)) as {
        error?: string;
        missing?: string[];
      } | null;

      if (res.status === 429) {
        toast.error(body?.error || ADMIN.tooManyAttempts);
        return;
      }

      if (res.status === 401) {
        toast.error(ADMIN.invalidLogin);
        return;
      }

      if (!res.ok) {
        const detail = body?.missing?.length
          ? `${body.error}\n${body.missing.join(" • ")}`
          : body?.error || ADMIN.serverError;
        toast.error(detail, { duration: 8000 });
        if (body?.missing?.length) {
          setEnvIssue(body.missing.join("، "));
        }
        return;
      }

      toast.success(ADMIN.welcome);
      // Full reload ensures Set-Cookie is applied before /admin middleware runs.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- auth cookie timing
      window.location.assign("/admin");
    } catch {
      toast.error(ADMIN.serverError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background px-4">
      <SetAdminRtl />
      <Card className="w-full max-w-md border-border bg-card">
        <CardHeader className="text-center">
          <Logo variant="full" priority className="mx-auto mb-4 h-16 sm:h-20" />
          <CardTitle className="font-display text-2xl">{ADMIN.loginTitle}</CardTitle>
          <p className="text-muted text-sm mt-2">{ADMIN.loginSubtitle}</p>
        </CardHeader>
        <CardContent>
          {envIssue && (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200">
              <div className="flex gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="space-y-1 text-start">
                  <p className="font-medium">{envIssue}</p>
                  <p className="text-amber-200/80">
                    Vercel → Settings → Environment Variables → Production
                  </p>
                  <p className="text-amber-200/80">
                    أضف <code className="text-amber-100">JWT_SECRET</code> (64 حرف) و{" "}
                    <code className="text-amber-100">DATABASE_URL</code> ثم Redeploy
                  </p>
                  <a
                    href="/api/health"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-primary underline mt-1"
                  >
                    فحص /api/health
                  </a>
                </div>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">{ADMIN.email}</Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                {...register("email")}
                className="mt-1.5"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1">أدخل بريداً صحيحاً</p>
              )}
            </div>
            <div>
              <Label htmlFor="password">{ADMIN.password}</Label>
              <Input
                id="password"
                type="password"
                dir="ltr"
                {...register("password")}
                className="mt-1.5"
              />
              {errors.password && (
                <p className="text-destructive text-xs mt-1">كلمة المرور مطلوبة</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? ADMIN.signingIn : ADMIN.signIn}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
