import { MessagesManager } from "@/components/admin/messages-manager";
import { ADMIN } from "@/lib/admin-labels";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return (
    <div>
      <h2 className="font-display text-2xl font-bold mb-6">{ADMIN.orders}</h2>
      <MessagesManager initialSearch={q || ""} />
    </div>
  );
}
