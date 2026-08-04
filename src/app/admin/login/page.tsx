"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Logo } from "@/components/layout/logo";
import { SetAdminRtl } from "@/components/admin/set-admin-rtl";
import { ADMIN } from "@/lib/admin-labels";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Login failed");
      toast.success(ADMIN.welcome);
      router.push("/admin");
    } catch {
      toast.error(ADMIN.invalidLogin);
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
