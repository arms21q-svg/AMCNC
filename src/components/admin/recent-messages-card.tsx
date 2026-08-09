import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ADMIN } from "@/lib/admin-labels";
import { getRecentMessagesAdmin } from "@/lib/services.server";
import { cn } from "@/lib/utils";

const statusColors = {
  NEW: "bg-green-500/10 text-green-400",
  READ: "bg-blue-500/10 text-blue-400",
  REPLIED: "bg-purple-500/10 text-purple-400",
};

export async function RecentMessagesCard() {
  const messages = await getRecentMessagesAdmin(5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>{ADMIN.recentActivity}</CardTitle>
        <Link href="/admin/messages" className="text-sm text-primary hover:underline">
          {ADMIN.orders} ←
        </Link>
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-muted">{ADMIN.noMessages}</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className="rounded-lg border border-border px-3 py-2.5 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{message.name}</p>
                    <p className="text-xs text-muted truncate">
                      {message.subject || message.message}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                      statusColors[message.status]
                    )}
                  >
                    {message.status === "NEW"
                      ? ADMIN.statusNew
                      : message.status === "READ"
                        ? ADMIN.statusRead
                        : ADMIN.statusReplied}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted">
                  {new Date(message.createdAt).toLocaleString("ar-IQ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
