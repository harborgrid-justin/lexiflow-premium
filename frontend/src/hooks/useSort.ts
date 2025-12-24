/**
 * @module hooks/useSort
 * @category Hooks - Data Utilities
 * @description Sorting hook with configurable initial key and direction. Provides memoized sorted
 * items array and requestSort function for toggling sort direction (asc ↔ desc) on column clicks.
 * Uses Array.sort with generic comparison logic.
 * 
 * NO THEME USAGE: Utility hook for sorting logic
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useMemo } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type Direction = 'asc' | 'desc';

interface SortConfig<T> {
  key: keyof T;
  direction: Direction;
}

// ============================================================================
// HOOK
// ============================================================================
export const useSort = <T extends Record<string, unknown>>(items: T[], initialKey: keyof T, initialDirection: Direction = 'asc') => {
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
    let direction: Direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return { items: sortedItems, requestSort, sortConfig };
};
