"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { Trash2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ADMIN } from "@/lib/admin-labels";
import { useAdminList } from "@/hooks/use-admin-list";
import { useSubmitLock } from "@/hooks/use-submit-lock";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

interface MessageRow {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: "NEW" | "READ" | "REPLIED";
  createdAt: string;
}

const statusColors = {
  NEW: "bg-green-500/10 text-green-400",
  READ: "bg-blue-500/10 text-blue-400",
  REPLIED: "bg-purple-500/10 text-purple-400",
};

const statusLabels = {
  NEW: ADMIN.statusNew,
  READ: ADMIN.statusRead,
  REPLIED: ADMIN.statusReplied,
};

export function MessagesManager() {
  const { runLocked } = useSubmitLock();
  const handleLoadError = useCallback(() => {
    toast.error("تعذر تحميل الرسائل");
  }, []);

  const {
    items: messages,
    meta,
    loading,
    fetching,
    setPage,
    search,
    setSearch,
    reload: load,
  } = useAdminList<"messages", MessageRow>({
    endpoint: "/api/admin/messages",
    listKey: "messages",
    limit: 15,
    onError: handleLoadError,
  });

  const updateStatus = async (id: string, status: MessageRow["status"]) => {
    await runLocked(async () => {
      try {
        const res = await fetch(`/api/admin/messages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed");
        toast.success("تم تحديث الحالة");
        await load();
      } catch {
        toast.error("فشل تحديث الحالة");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("حذف هذه الرسالة؟")) return;
    await runLocked(async () => {
      try {
        const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
        toast.success("تم الحذف");
        await load();
      } catch {
        toast.error("فشل الحذف");
      }
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">{ADMIN.messages}</h2>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>
            {ADMIN.contactMessages} ({meta.total})
          </CardTitle>
          <AdminSearch value={search} onChange={setSearch} placeholder="بحث في الرسائل..." />
        </CardHeader>
        <CardContent>
          {loading && messages.length === 0 ? (
            <AdminTableSkeleton rows={3} />
          ) : messages.length === 0 ? (
            <p className="text-muted text-sm">{ADMIN.noMessages}</p>
          ) : (
            <>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className="rounded-lg border border-border p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium">{msg.name}</p>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              statusColors[msg.status]
                            )}
                          >
                            {statusLabels[msg.status]}
                          </span>
                        </div>
                        <a
                          href={`mailto:${msg.email}`}
                          className="text-sm text-primary flex items-center gap-1"
                          dir="ltr"
                        >
                          <Mail className="h-3 w-3" />
                          {msg.email}
                        </a>
                        {msg.phone && (
                          <p className="text-sm text-muted mt-1" dir="ltr">
                            {msg.phone}
                          </p>
                        )}
                        {msg.subject && (
                          <p className="text-sm font-medium mt-2">{msg.subject}</p>
                        )}
                        <p className="text-sm text-muted mt-2 whitespace-pre-wrap">
                          {msg.message}
                        </p>
                        <p className="text-xs text-muted mt-2">
                          {new Date(msg.createdAt).toLocaleString("ar-IQ")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.status === "NEW" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void updateStatus(msg.id, "READ")}
                          >
                            {ADMIN.markRead}
                          </Button>
                        )}
                        {msg.status !== "REPLIED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void updateStatus(msg.id, "REPLIED")}
                          >
                            {ADMIN.markReplied}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => void handleDelete(msg.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <AdminPagination meta={meta} onPageChange={setPage} disabled={fetching} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
