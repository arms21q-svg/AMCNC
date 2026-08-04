"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";

export function SeedDemoCard() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    if (
      !confirm(
        "سيتم إضافة بيانات تجريبية (أعمال، إعدادات، روابط). البيانات الموجودة لن تُحذف. متابعة؟"
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/seed-demo", { method: "POST" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      toast.success(
        `${ADMIN.seedSuccess}: ${data.projectsAdded} أعمال، ${data.servicesAdded} خدمات`
      );
    } catch {
      toast.error(ADMIN.seedFailed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Database className="h-5 w-5 text-primary" />
          {ADMIN.seedTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted text-sm">{ADMIN.seedDesc}</p>
        <Button variant="outline" onClick={handleSeed} disabled={loading}>
          {loading ? ADMIN.seeding : ADMIN.seedButton}
        </Button>
      </CardContent>
    </Card>
  );
}
