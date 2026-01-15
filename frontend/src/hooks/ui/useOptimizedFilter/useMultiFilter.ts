/**
 * @module hooks/useOptimizedFilter/useMultiFilter
 * @description Optimized multi-criteria filtering with React 18 transitions.
 *
 * @example
 * ```tsx
 * const { filteredData, updateFilter, isPending } = useMultiFilter(
 *   documents,
 *   (docs, filters) => docs.filter(d =>
 *     d.title.includes(filters.search) &&
 *     (filters.type ? d.type === filters.type : true)
 *   ),
 *   { search: '', type: '' }
 * );
 * ```
 */

import { useCallback, useMemo, useState, useTransition } from "react";
import type { MultiFilterReturn } from "./types";

export function useMultiFilter<T, F extends Record<string, unknown>>(
  data: T[],
  filterFn: (data: T[], filters: F) => T[],
  initialFilters: F
): MultiFilterReturn<T, F> {
  const [filters, setFiltersState] = useState<F>(initialFilters);
  const [isPending, startTransition] = useTransition();

  const filteredData = useMemo(
    () => filterFn(data, filters),
    [data, filters, filterFn]
  );

  const updateFilter = useCallback((updates: Partial<F>) => {
    startTransition(() => {
      setFiltersState((prev) => ({ ...prev, ...updates }));
    });
  }, []);

  const resetFilters = useCallback(() => {
    startTransition(() => {
      setFiltersState(initialFilters);
    });
  }, [initialFilters]);

  return {
    filteredData,
    filters,
    updateFilter,
    resetFilters,
    isPending,
  };
}
