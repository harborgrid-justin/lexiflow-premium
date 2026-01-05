/**
 * @module hooks/useSort
 * @category Hooks - Data Utilities
 * 
 * Provides client-side sorting with toggle functionality.
 * Useful for table columns and list views.
 * 
 * @example
 * ```typescript
 * const { items: sortedCases, requestSort, sortConfig } = useSort(
 *   cases,
 *   'filingDate',
 *   'desc'
 * );
 * 
 * <th onClick={() => requestSort('caseNumber')}>
 *   Case Number {sortConfig.key === 'caseNumber' && (
 *     sortConfig.direction === 'asc' ? '↑' : '↓'
 *   )}
 * </th>
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useMemo } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig<T> {
  /** Key to sort by */
  key: keyof T;
  /** Sort direction */
  direction: SortDirection;
}

/**
 * Return type for useSort hook
 */
export interface UseSortReturn<T> {
  /** Sorted items array */
  items: T[];
  /** Request sort by key (toggles direction if same key) */
  requestSort: (key: keyof T) => void;
  /** Current sort configuration */
  sortConfig: SortConfig<T>;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages client-side sorting of array data.
 * 
 * @param items - Array of items to sort
 * @param initialKey - Initial sort key
 * @param initialDirection - Initial sort direction (default: 'asc')
 * @returns Object with sorted items, requestSort method, and current config
 */
export function useSort<T extends Record<string, unknown>>(
  items: T[],
  initialKey: keyof T,
  initialDirection: SortDirection = 'asc'
): UseSortReturn<T> {
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>({
    key: initialKey,
    direction: initialDirection,
  });

  const sortedItems = useMemo(() => {
    const sortableItems = [...items];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [items, sortConfig]);

  const requestSort = (key: keyof T) => {
    let direction: SortDirection = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
}
