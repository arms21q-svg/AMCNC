"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ADMIN } from "@/lib/admin-labels";

type AdminSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function AdminSearch({
  value,
  onChange,
  placeholder = ADMIN.searchPlaceholder,
}: AdminSearchProps) {
  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ps-9 pe-9"
        aria-label={placeholder}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-1 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label={ADMIN.clearSearch}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
