/**
 * useSelection.ts
 * 
 * Reusable hook for managing item selection state
 * Replaces repeated selectedItem/setSelectedItem patterns
 */

import { useState, useCallback } from 'react';

export interface UseSelectionReturn<T> {
  selected: T | null;
  select: (item: T) => void;
  deselect: () => void;
  toggle: (item: T, compareFn?: (a: T, b: T) => boolean) => void;
  isSelected: (item: T, compareFn?: (a: T, b: T) => boolean) => boolean;
}

/**
 * useSelection - Single item selection management
 * 
 * @example
 * ```tsx
 * const selection = useSelection<User>();
 * 
 * <Button onClick={() => selection.select(user)}>Select</Button>
 * {selection.selected && <UserDetail user={selection.selected} />}
 * ```
 */
export const useSelection = <T>(initialValue: T | null = null): UseSelectionReturn<T> => {
  const [selected, setSelected] = useState<T | null>(initialValue);

  const select = useCallback((item: T) => {
    setSelected(item);
  }, []);

  const deselect = useCallback(() => {
    setSelected(null);
  }, []);

  const toggle = useCallback((item: T, compareFn?: (a: T, b: T) => boolean) => {
    setSelected(prev => {
      if (!prev) return item;
      const isEqual = compareFn ? compareFn(prev, item) : prev === item;
      return isEqual ? null : item;
    });
  }, []);

  const isSelected = useCallback((item: T, compareFn?: (a: T, b: T) => boolean): boolean => {
    if (!selected) return false;
    return compareFn ? compareFn(selected, item) : selected === item;
  }, [selected]);

  return {
    selected,
    select,
    deselect,
    toggle,
    isSelected
  };
};

/**
 * useMultiSelection - Multiple item selection management
 */
export interface UseMultiSelectionReturn<T> {
  selected: T[];
  select: (item: T) => void;
  selectMany: (items: T[]) => void;
  deselect: (item: T) => void;
  deselectAll: () => void;
  toggle: (item: T, compareFn?: (a: T, b: T) => boolean) => void;
  isSelected: (item: T, compareFn?: (a: T, b: T) => boolean) => boolean;
}

export const useMultiSelection = <T>(initialValue: T[] = []): UseMultiSelectionReturn<T> => {
  const [selected, setSelected] = useState<T[]>(initialValue);

  const select = useCallback((item: T) => {
    setSelected(prev => [...prev, item]);
  }, []);

  const selectMany = useCallback((items: T[]) => {
    setSelected(prev => [...prev, ...items]);
  }, []);

  const deselect = useCallback((item: T) => {
    setSelected(prev => prev.filter(i => i !== item));
  }, []);

  const deselectAll = useCallback(() => {
    setSelected([]);
  }, []);

  const toggle = useCallback((item: T, compareFn?: (a: T, b: T) => boolean) => {
    setSelected(prev => {
      const isInList = prev.some(i => compareFn ? compareFn(i, item) : i === item);
      if (isInList) {
        return prev.filter(i => compareFn ? !compareFn(i, item) : i !== item);
      }
      return [...prev, item];
    });
  }, []);

  const isSelected = useCallback((item: T, compareFn?: (a: T, b: T) => boolean): boolean => {
    return selected.some(i => compareFn ? compareFn(i, item) : i === item);
  }, [selected]);

  return {
    selected,
    select,
    selectMany,
    deselect,
    deselectAll,
    toggle,
    isSelected
  };
};
