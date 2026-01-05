/**
 * @module hooks/useMultiSelection
 * @category Hooks - UI Utilities
 * 
 * Simplified multi-selection with toggle, select all, and clear.
 * Tracks selected items with convenient state helpers.
 * 
 * @example
 * ```typescript
 * const selection = useMultiSelection<Document>([], (a, b) => a.id === b.id);
 * 
 * // Toggle selection
 * <checkbox onChange={() => selection.toggle(doc)} checked={selection.isSelected(doc)} />
 * 
 * // Select all
 * <button onClick={() => selection.selectAll(documents)}>Select All</button>
 * 
 * // Clear
 * <button onClick={selection.clear}>Clear</button>
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useMultiSelection hook
 */
export interface UseMultiSelectionReturn<T> {
  /** Array of currently selected items */
  selected: T[];
  /** Select a single item (adds to selection) */
  select: (item: T) => void;
  /** Deselect a single item (removes from selection) */
  deselect: (item: T) => void;
  /** Toggle item selection */
  toggle: (item: T) => void;
  /** Select all items from provided list */
  selectAll: (items: T[]) => void;
  /** Clear all selections */
  clear: () => void;
  /** Check if item is selected */
  isSelected: (item: T) => boolean;
  /** Check if all items are selected */
  isAllSelected: (items: T[]) => boolean;
  /** Check if some but not all items are selected */
  isIndeterminate: (items: T[]) => boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages multi-selection state with toggle, select all, and clear.
 * 
 * @param initialSelection - Initial selected items
 * @param compareFn - Function to compare items for equality
 * @returns Object with selection state and operations
 */
export function useMultiSelection<T = unknown>(
  initialSelection: T[] = [],
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): UseMultiSelectionReturn<T> {
  const [selected, setSelected] = useState<T[]>(initialSelection);

  const select = useCallback((item: T) => {
    setSelected(prev => {
      const exists = prev.some(s => compareFn(s, item));
      return exists ? prev : [...prev, item];
    });
  }, [compareFn]);

  const deselect = useCallback((item: T) => {
    setSelected(prev => prev.filter(s => !compareFn(s, item)));
  }, [compareFn]);

  const toggle = useCallback((item: T) => {
    setSelected(prev => {
      const exists = prev.some(s => compareFn(s, item));
      return exists 
        ? prev.filter(s => !compareFn(s, item))
        : [...prev, item];
    });
  }, [compareFn]);

  const selectAll = useCallback((items: T[]) => {
    setSelected(items);
  }, []);

  const clear = useCallback(() => {
    setSelected([]);
  }, []);

  const isSelected = useCallback((item: T) => {
    return selected.some(s => compareFn(s, item));
  }, [selected, compareFn]);

  const isAllSelected = useCallback((items: T[]) => {
    return items.length > 0 && items.every(item => selected.some(s => compareFn(s, item)));
  }, [selected, compareFn]);

  const isIndeterminate = useCallback((items: T[]) => {
    const selectedCount = items.filter(item => selected.some(s => compareFn(s, item))).length;
    return selectedCount > 0 && selectedCount < items.length;
  }, [selected, compareFn]);

  return {
    selected,
    select,
    deselect,
    toggle,
    selectAll,
    clear,
    isSelected,
    isAllSelected,
    isIndeterminate
  };
};

/**
 * Simple single-selection hook that returns the selected item and selection methods
 */
export interface SingleSelection<T> {
  /** Currently selected item */
  selected: T | null;
  /** Select an item */
  select: (item: T | null) => void;
  /** Deselect current item */
  deselect: () => void;
  /** Check if item is selected */
  isSelected: (item: T) => boolean;
}

/**
 * Manages single item selection with custom comparison function.
 */
export function useSingleSelection<T = unknown>(
  initialSelection: T | null = null,
  compareFn: (a: T, b: T) => boolean = (a, b) => a === b
): SingleSelection<T> {
  const [selected, setSelected] = useState<T | null>(initialSelection);

  const select = useCallback((item: T | null) => {
    setSelected(item);
  }, []);

  const deselect = useCallback(() => {
    setSelected(null);
  }, []);

  const isSelected = useCallback((item: T) => {
    return selected !== null && compareFn(selected, item);
  }, [selected, compareFn]);

  return {
    selected,
    select,
    deselect,
    isSelected
  };
}
