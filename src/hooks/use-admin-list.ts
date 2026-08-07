"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";
import type { AdminListMeta } from "@/lib/admin-query";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const defaultMeta: AdminListMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

type UseAdminListOptions<TKey extends string> = {
  endpoint: string;
  listKey: TKey;
  limit?: number;
  enabled?: boolean;
  onError?: (error: unknown) => void;
};

export function useAdminList<TKey extends string, TItem>(
  options: UseAdminListOptions<TKey>
) {
  const { endpoint, listKey, limit = 20, enabled = true, onError } = options;
  const [items, setItems] = useState<TItem[]>([]);
  const [meta, setMeta] = useState<AdminListMeta>(defaultMeta);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState("");
  const debouncedSearch = useDebouncedValue(search);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const load = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (debouncedSearch) params.set("q", debouncedSearch);

      const data = await fetchJson<Record<TKey, TItem[]> & { meta?: AdminListMeta }>(
        `${endpoint}?${params.toString()}`
      );

      setItems(data[listKey] || []);
      setMeta(data.meta || defaultMeta);
    } catch (error) {
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, enabled, endpoint, limit, listKey, onError, page]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void load();
    });
    return () => cancelAnimationFrame(frame);
  }, [load]);

  return {
    items,
    meta,
    loading,
    page,
    setPage,
    search,
    setSearch,
    reload: load,
  };
}
