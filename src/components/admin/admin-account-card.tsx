"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, UserCog, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ADMIN } from "@/lib/admin-labels";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export function AdminAccountCard() {
  const router = useRouter();
  const [account, setAccount] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccount = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ authenticated?: boolean; user?: AdminUser }>(
        "/api/auth/me"
      );
      if (!isActive()) return;
      if (data.user) setAccount(data.user);
    } catch {
      if (isActive()) setAccount(null);
    } finally {
      if (isActive()) setLoading(false);
    }
  }, []);

  useMountFetch(fetchAccount);

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-sm text-muted">{ADMIN.loading}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5 text-primary" />
          {ADMIN.accountSettings}
        </CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/account">{ADMIN.edit}</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {account ? (
          <div className="space-y-2 text-sm">
            {account.name ? (
              <p>
                <span className="text-muted">{ADMIN.accountProfile}: </span>
                <span className="font-medium">{account.name}</span>
              </p>
            ) : null}
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted shrink-0" />
              <span dir="ltr" className="font-medium truncate">
                {account.email}
              </span>
            </p>
            <p className="text-xs text-muted">
              {ADMIN.accountRole}: {account.role}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted">{ADMIN.accountLoadFailed}</p>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild size="sm">
            <Link href="/admin/account">{ADMIN.accountSettings}</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 me-1.5" />
            {ADMIN.logout}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
