"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ADMIN } from "@/lib/admin-labels";
import type { AdminListMeta } from "@/lib/admin-query";

type AdminPaginationProps = {
  meta: AdminListMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
};

export function AdminPagination({
  meta,
  onPageChange,
  disabled = false,
}: AdminPaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
      <p className="text-xs text-muted">
        {ADMIN.pageOf(meta.page, meta.totalPages, meta.total)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          <ChevronRight className="h-4 w-4" />
          {ADMIN.prevPage}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          {ADMIN.nextPage}
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
