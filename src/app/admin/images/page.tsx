import dynamic from "next/dynamic";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

const MediaLibrary = dynamic(
  () =>
    import("@/components/admin/media-library").then((m) => ({
      default: m.MediaLibrary,
    })),
  { loading: () => <AdminTableSkeleton rows={4} /> }
);

export default function AdminImagesPage() {
  return <MediaLibrary />;
}
