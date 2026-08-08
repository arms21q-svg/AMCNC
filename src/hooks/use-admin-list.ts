"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [page, setPageState] = useState(1);
  const [search, setSearchState] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const requestSeq = useRef(0);

  const setPage = useCallback((next: number) => {
    setPageState(Math.max(1, next));
  }, []);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPageState(1);
  }, []);

  const load = useCallback(async () => {
    if (!enabled) return;

    const seq = ++requestSeq.current;
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

      if (seq !== requestSeq.current) return;

      const nextMeta = data.meta ?? defaultMeta;
      const rawList = data[listKey];
      const nextItems = Array.isArray(rawList) ? rawList : [];

      // Page out of range: total says N items but this page is empty (e.g. page=2, totalPages=1).
      if (nextMeta.total > 0 && page > nextMeta.totalPages) {
        setPageState(nextMeta.totalPages);
        return;
      }

      setItems(nextItems);
      setMeta(nextMeta);
    } catch (error) {
      if (seq === requestSeq.current) {
        onError?.(error);
      }
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false);
      }
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
