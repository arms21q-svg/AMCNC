"use client";

import { useCallback, useRef } from "react";

export function useSubmitLock() {
  const lockRef = useRef(false);

  const runLocked = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (lockRef.current) return undefined;
    lockRef.current = true;
    try {
      return await fn();
    } finally {
      lockRef.current = false;
    }
  }, []);

  const isLocked = useCallback(() => lockRef.current, []);

  return { runLocked, isLocked };
}
