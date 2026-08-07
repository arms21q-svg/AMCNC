import dynamic from "next/dynamic";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const SocialLinksManager = dynamic(
  () =>
    import("@/components/admin/social-links-manager").then((m) => ({
      default: m.SocialLinksManager,
    })),
  { loading: () => <AdminTableSkeleton rows={4} /> }
);

export default function AdminSocialPage() {
  return <SocialLinksManager />;
}
