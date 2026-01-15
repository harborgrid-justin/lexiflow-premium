/**
 * @module hooks/useOptimizedFilter/types
 * @description Type definitions for optimized filter hooks
 */

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

export interface MultiFilterReturn<T, F extends Record<string, unknown>> {
  filteredData: T[];
  filters: F;
  updateFilter: (updates: Partial<F>) => void;
  resetFilters: () => void;
  isPending: boolean;
}

export interface OptimizedSortReturn<T> {
  sortedData: T[];
  sortKey: string;
  sortDirection: 'asc' | 'desc';
  setSortKey: (key: string) => void;
  toggleSortDirection: () => void;
  isPending: boolean;
}
