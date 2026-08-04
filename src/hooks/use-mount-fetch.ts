"use client";

import { useCallback, useEffect, useState } from "react";

export type MountFetchGuard = () => boolean;

/**
 * Fetch on mount/reload. Work is deferred until after commit, and callers
 * should guard setState with the `isActive` callback when using async fetchers.
 */
export function useMountFetch(fetcher: (isActive: MountFetchGuard) => Promise<void>) {
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => {
    setLoading(true);
    setTick((n) => n + 1);
  }, []);

  useEffect(() => {
    let active = true;
    const isActive = () => active;

    const frame = requestAnimationFrame(() => {
      void (async () => {
        try {
          await fetcher(isActive);
        } finally {
          if (isActive()) {
            setLoading(false);
          }
        }
      })();
    });

    return () => {
      active = false;
      cancelAnimationFrame(frame);
    };
  }, [fetcher, tick]);

  return { loading, reload };
}
