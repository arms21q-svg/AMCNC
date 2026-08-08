import { LoadingState } from "@/components/ui/state-message";

export default function AdminLoading() {
  return (
    <div className="dark min-h-[50vh] bg-background">
      <LoadingState title="جاري تحميل لوحة التحكم..." />
    </div>
  );
}
