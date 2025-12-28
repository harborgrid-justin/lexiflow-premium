/**
 * @module hooks/useOptimizedFilter
 * @category Hooks - Performance
 * @description React 18 concurrent rendering optimization for expensive filter/search operations.
 * Uses useTransition to prevent UI blocking during heavy computations while maintaining responsiveness.
 * 
 * React 18 Best Practice: Wrap expensive state updates in startTransition for better UX
 * 
 * @example
 * ```tsx
 * function CaseList() {
 *   const { filteredData, setFilterTerm, isPending } = useOptimizedFilter(
 *     cases,
 *     (cases, term) => cases.filter(c => c.title.includes(term))
 *   );
 *   
 *   return (
 *     <>
 *       <input onChange={(e) => setFilterTerm(e.target.value)} />
 *       {isPending && <Spinner />}
 *       {filteredData.map(c => <CaseCard key={c.id} case={c} />)}
 *     </>
 *   );
 * }
 * ```
 */

import { useState, useTransition, useMemo, useCallback } from 'react';

export interface OptimizedFilterConfig {
  /** Initial filter term */
  initialTerm?: string;
  /** Debounce delay in ms (optional) */
  debounceMs?: number;
}

export interface OptimizedFilterReturn<T> {
  /** Filtered data array */
  filteredData: T[];
  /** Current filter term */
  filterTerm: string;
  /** Update filter term (wrapped in transition) */
  setFilterTerm: (term: string) => void;
  /** Whether transition is pending */
  isPending: boolean;
  /** Reset filter */
  resetFilter: () => void;
}

/**
 * Optimized filtering with React 18 transitions
 * 
 * @param data - Source data array
 * @param filterFn - Filter function (data, term) => filtered
 * @param config - Optional configuration
 * @returns Filtering state and controls
 */
export function useOptimizedFilter<T>(
  data: T[],
  filterFn: (data: T[], term: string) => T[],
  config: OptimizedFilterConfig = {}
): OptimizedFilterReturn<T> {
  const { initialTerm = '' } = config;
  
  const [filterTerm, setFilterTermState] = useState(initialTerm);
  const [isPending, startTransition] = useTransition();

  // Memoize filtered data
  const filteredData = useMemo(
    () => filterFn(data, filterTerm),
    [data, filterTerm, filterFn]
  );

  // Wrap filter updates in transition for non-blocking updates
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
    resetFilter
  };
}

/**
 * Optimized multi-criteria filtering with transitions
 * 
 * @example
 * ```tsx
 * function DocumentList() {
 *   const { filteredData, updateFilter, isPending } = useMultiFilter(
 *     documents,
 *     (docs, filters) => docs.filter(d => 
 *       d.title.includes(filters.search) && 
 *       (filters.type ? d.type === filters.type : true)
 *     )
 *   );
 *   
 *   return (
 *     <>
 *       <input onChange={(e) => updateFilter({ search: e.target.value })} />
 *       <select onChange={(e) => updateFilter({ type: e.target.value })}>
 *         <option value="">All Types</option>
 *       </select>
 *       {isPending && <Spinner />}
 *       {filteredData.map(d => <DocCard key={d.id} doc={d} />)}
 *     </>
 *   );
 * }
 * ```
 */
export function useMultiFilter<T, F extends Record<string, unknown>>(
  data: T[],
  filterFn: (data: T[], filters: F) => T[],
  initialFilters: F
) {
  const [filters, setFiltersState] = useState<F>(initialFilters);
  const [isPending, startTransition] = useTransition();

  const filteredData = useMemo(
    () => filterFn(data, filters),
    [data, filters, filterFn]
  );

  const updateFilter = useCallback((updates: Partial<F>) => {
    startTransition(() => {
      setFiltersState(prev => ({ ...prev, ...updates }));
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
    isPending
  };
}

/**
 * Optimized sorting with transitions
 * 
 * @param data - Source data array
 * @param initialSortKey - Initial sort field
 * @param sortFunctions - Map of sort key to comparison function
 */
export function useOptimizedSort<T>(
  data: T[],
  initialSortKey: string,
  sortFunctions: Record<string, (a: T, b: T) => number>
) {
  const [sortKey, setSortKeyState] = useState(initialSortKey);
  const [sortDirection, setSortDirectionState] = useState<'asc' | 'desc'>('asc');
  const [isPending, startTransition] = useTransition();

  const sortedData = useMemo(() => {
    const sortFn = sortFunctions[sortKey];
    if (!sortFn) return data;

    const sorted = [...data].sort(sortFn);
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [data, sortKey, sortDirection, sortFunctions]);

  const setSortKey = useCallback((key: string) => {
    startTransition(() => {
      setSortKeyState(key);
    });
  }, []);

  const toggleSortDirection = useCallback(() => {
    startTransition(() => {
      setSortDirectionState(prev => prev === 'asc' ? 'desc' : 'asc');
    });
  }, []);

  return {
    sortedData,
    sortKey,
    sortDirection,
    setSortKey,
    toggleSortDirection,
    isPending
  };
}
