import dynamic from "next/dynamic";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const HomepageManager = dynamic(
  () =>
    import("@/components/admin/homepage-manager").then((m) => ({
      default: m.HomepageManager,
    })),
  { loading: () => <AdminTableSkeleton rows={4} /> }
);

export default function AdminHomepagePage() {
  return <HomepageManager />;
}
