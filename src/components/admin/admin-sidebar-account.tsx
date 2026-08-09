"use client";

import { useCallback, useState } from "react";
import { Mail } from "lucide-react";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";

type AdminUser = {
  email: string;
  name: string;
};

export function AdminSidebarAccount() {
  const [account, setAccount] = useState<AdminUser | null>(null);

  const fetchAccount = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ user?: AdminUser }>("/api/auth/me");
      if (!isActive()) return;
      if (data.user) setAccount(data.user);
    } catch {
      if (isActive()) setAccount(null);
    }
  }, []);

  useMountFetch(fetchAccount);

  if (!account) return null;

  return (
    <div className="mb-2 rounded-lg border border-border bg-background/60 px-3 py-2.5">
      {account.name ? (
        <p className="truncate text-xs font-medium text-foreground">{account.name}</p>
      ) : null}
      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted">
        <Mail className="h-3 w-3 shrink-0" />
        <span dir="ltr" className="truncate">
          {account.email}
        </span>
      </p>
    </div>
  );
}
