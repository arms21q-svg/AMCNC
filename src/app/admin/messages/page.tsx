import dynamic from "next/dynamic";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const MessagesManager = dynamic(
  () =>
    import("@/components/admin/messages-manager").then((m) => ({
      default: m.MessagesManager,
    })),
  { loading: () => <AdminTableSkeleton rows={4} /> }
);

export default function AdminMessagesPage() {
  return <MessagesManager />;
}
