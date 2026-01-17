/**
 * @module hooks/useOptimizedFilter/useOptimizedSort
 * @description Optimized sorting with React 18 transitions.
 */

import { useCallback, useMemo, useState, useTransition } from "react";

import type { OptimizedSortReturn } from "./types";

export function useOptimizedSort<T>(
  data: T[],
  initialSortKey: string,
  sortFunctions: Record<string, (a: T, b: T) => number>
): OptimizedSortReturn<T> {
  const [sortKey, setSortKeyState] = useState(initialSortKey);
  const [sortDirection, setSortDirectionState] = useState<"asc" | "desc">(
    "asc"
  );
  const [isPending, startTransition] = useTransition();

  const sortedData = useMemo(() => {
    const sortFn = sortFunctions[sortKey];
    if (!sortFn) return data;

    const sorted = [...data].sort(sortFn);
    return sortDirection === "desc" ? sorted.reverse() : sorted;
  }, [data, sortKey, sortDirection, sortFunctions]);

  const setSortKey = useCallback((key: string) => {
    startTransition(() => {
      setSortKeyState(key);
    });
  }, []);

  const toggleSortDirection = useCallback(() => {
    startTransition(() => {
      setSortDirectionState((prev) => (prev === "asc" ? "desc" : "asc"));
    });
  }, []);

  return {
    sortedData,
    sortKey,
    sortDirection,
    setSortKey,
    toggleSortDirection,
    isPending,
  };
}
