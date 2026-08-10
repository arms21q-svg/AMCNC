"use client";

import { useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ADMIN } from "@/lib/admin-labels";
import { useAdminList } from "@/hooks/use-admin-list";
import { AdminSearch } from "@/components/admin/admin-search";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminTableSkeleton } from "@/components/admin/admin-table-skeleton";

interface CustomerRow {
  email: string;
  name: string;
  phone?: string | null;
  orderCount: number;
  lastOrderAt: string;
  latestDeliveryStatus: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

const deliveryColors = {
  PENDING: "bg-amber-500/10 text-amber-400",
  PROCESSING: "bg-blue-500/10 text-blue-400",
  SHIPPED: "bg-purple-500/10 text-purple-400",
  DELIVERED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

const deliveryLabels = {
  PENDING: ADMIN.deliveryPending,
  PROCESSING: ADMIN.deliveryProcessing,
  SHIPPED: ADMIN.deliveryShipped,
  DELIVERED: ADMIN.deliveryDelivered,
  CANCELLED: ADMIN.deliveryCancelled,
};

export function CustomersManager() {
  const handleLoadError = useCallback(() => {
    toast.error(ADMIN.customersLoadFailed);
  }, []);

  const {
    items: customers,
    meta,
    loading,
    fetching,
    setPage,
    search,
    setSearch,
  } = useAdminList<"customers", CustomerRow>({
    endpoint: "/api/admin/customers",
    listKey: "customers",
    limit: 20,
    onError: handleLoadError,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">{ADMIN.customers}</h2>
        <p className="text-muted mt-1 text-sm">{ADMIN.customersHint}</p>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <CardTitle>
            {ADMIN.customers} ({meta.total})
          </CardTitle>
          <AdminSearch
            value={search}
            onChange={setSearch}
            placeholder={ADMIN.customersSearchPlaceholder}
          />
        </CardHeader>
        <CardContent>
          {loading && customers.length === 0 ? (
            <AdminTableSkeleton rows={4} />
          ) : customers.length === 0 ? (
            <p className="text-muted text-sm">{ADMIN.noCustomers}</p>
          ) : (
            <>
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div
                    key={customer.email}
                    className="rounded-lg border border-border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium">{customer.name}</p>
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-sm text-primary flex items-center gap-1 mt-1"
                        dir="ltr"
                      >
                        <Mail className="h-3 w-3 shrink-0" />
                        {customer.email}
                      </a>
                      {customer.phone ? (
                        <p className="text-sm text-muted mt-1 flex items-center gap-1" dir="ltr">
                          <Phone className="h-3 w-3 shrink-0" />
                          {customer.phone}
                        </p>
                      ) : null}
                      <p className="text-xs text-muted mt-2">
                        {ADMIN.lastOrder}:{" "}
                        {new Date(customer.lastOrderAt).toLocaleString("ar-IQ")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:items-end shrink-0">
                      <span className="text-sm">
                        {ADMIN.orderCount}: {customer.orderCount}
                      </span>
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full w-fit",
                          deliveryColors[customer.latestDeliveryStatus]
                        )}
                      >
                        {deliveryLabels[customer.latestDeliveryStatus]}
                      </span>
                      <Link
                        href={`/admin/messages?q=${encodeURIComponent(customer.email)}`}
                        className="text-xs text-primary hover:underline"
                      >
                        {ADMIN.viewCustomerOrders} ←
                      </Link>
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
