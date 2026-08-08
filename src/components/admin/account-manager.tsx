"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";
import { useMountFetch } from "@/hooks/use-mount-fetch";
import { fetchJson } from "@/lib/fetch-json";
import { parseJsonResponse } from "@/lib/parse-json-response";

type AccountUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

export function AccountManager() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async (isActive: () => boolean) => {
    try {
      const data = await fetchJson<{ user?: AccountUser }>("/api/admin/account");
      if (!isActive()) return;
      if (data.user) {
        setUser(data.user);
        setEmail(data.user.email);
      }
    } catch {
      if (isActive()) toast.error(ADMIN.accountLoadFailed);
    }
  }, []);

  const { loading } = useMountFetch(fetchData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toast.error(ADMIN.accountPasswordMismatch);
      return;
    }

    const emailChanged = user && email.trim().toLowerCase() !== user.email.toLowerCase();
    const passwordChanged = Boolean(newPassword);

    if (!emailChanged && !passwordChanged) {
      toast.error(ADMIN.accountNoChanges);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          ...(emailChanged ? { email: email.trim() } : {}),
          ...(passwordChanged
            ? { newPassword, confirmPassword }
            : {}),
        }),
      });

      const data = await parseJsonResponse<{
        success?: boolean;
        user?: AccountUser;
        message?: string;
      }>(res);

      if (data.user) {
        setUser(data.user);
        setEmail(data.user.email);
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(data.message || ADMIN.accountSaveSuccess);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : ADMIN.saveFailed);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-muted text-sm">{ADMIN.loading}</p>;
  }

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="font-display text-2xl font-bold">{ADMIN.accountSettings}</h2>
        <p className="text-muted mt-1 text-sm">{ADMIN.accountSettingsHint}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{ADMIN.accountProfile}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-email">{ADMIN.email}</Label>
              <Input
                id="account-email"
                type="email"
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current-password">{ADMIN.accountCurrentPassword}</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <p className="text-muted text-xs">{ADMIN.accountCurrentPasswordHint}</p>
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <p className="text-sm font-medium">{ADMIN.accountChangePassword}</p>

              <div className="space-y-2">
                <Label htmlFor="new-password">
                  {ADMIN.accountNewPassword}{" "}
                  <span className="text-muted font-normal">{ADMIN.optional}</span>
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">
                  {ADMIN.accountConfirmPassword}{" "}
                  <span className="text-muted font-normal">{ADMIN.optional}</span>
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? ADMIN.saving : ADMIN.save}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
