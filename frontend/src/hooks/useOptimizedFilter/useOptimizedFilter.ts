/**
 * @module hooks/useOptimizedFilter/useOptimizedFilter
 * @description React 18 concurrent rendering optimization for filter operations.
 *
 * @example
 * ```tsx
 * const { filteredData, setFilterTerm, isPending } = useOptimizedFilter(
 *   cases,
 *   (cases, term) => cases.filter(c => c.title.includes(term))
 * );
 * ```
 */

import { useCallback, useMemo, useState, useTransition } from "react";
import type { OptimizedFilterConfig, OptimizedFilterReturn } from "./types";

export function useOptimizedFilter<T>(
  data: T[],
  filterFn: (data: T[], term: string) => T[],
  config: OptimizedFilterConfig = {}
): OptimizedFilterReturn<T> {
  const { initialTerm = "" } = config;

  const [filterTerm, setFilterTermState] = useState(initialTerm);
  const [isPending, startTransition] = useTransition();

  const filteredData = useMemo(
    () => filterFn(data, filterTerm),
    [data, filterTerm, filterFn]
  );

  const setFilterTerm = useCallback((term: string) => {
    startTransition(() => {
      setFilterTermState(term);
    });
  }, []);

  const resetFilter = useCallback(() => {
    startTransition(() => {
      setFilterTermState(initialTerm);
    });
  }, [initialTerm]);

  return {
    filteredData,
    filterTerm,
    setFilterTerm,
    isPending,
    resetFilter,
  };
}
