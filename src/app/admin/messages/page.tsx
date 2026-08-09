import { MessagesManager } from "@/components/admin/messages-manager";
import { ADMIN } from "@/lib/admin-labels";

export default function AdminMessagesPage() {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">{ADMIN.orders}</h2>
      <MessagesManager />
    </div>
  );
}
