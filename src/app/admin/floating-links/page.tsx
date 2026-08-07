import dynamic from "next/dynamic";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const FloatingLinksManager = dynamic(
  () =>
    import("@/components/admin/floating-links-manager").then((m) => ({
      default: m.FloatingLinksManager,
    })),
  { loading: () => <AdminTableSkeleton rows={4} /> }
);

export default function AdminFloatingLinksPage() {
  return <FloatingLinksManager />;
}
