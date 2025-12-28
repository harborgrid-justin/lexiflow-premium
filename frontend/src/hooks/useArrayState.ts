/**
 * @module hooks/useArrayState
 * @category Hooks - State Management
 * 
 * Manages array state with intent-based operations.
 * Provides type-safe methods for common array mutations.
 * 
 * @example
 * ```typescript
 * const todos = useArrayState<Todo>([]);
 * 
 * // Add item
 * todos.add({ id: '1', title: 'New task', done: false });
 * 
 * // Update by predicate
 * todos.update(t => t.id === '1', { done: true });
 * 
 * // Remove by predicate
 * todos.remove(t => t.done);
 * 
 * // Replace all items
 * todos.replace(newTodoList);
 * 
 * // Clear all
 * todos.clear();
 * ```
 */

import { useState, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useArrayState hook
 * Provides array state and intent-based mutation methods
 */
export interface UseArrayStateReturn<T> {
  /** Current array items */
  items: T[];
  /** Add single item to array */
  add: (item: T) => void;
  /** Remove items matching predicate */
  remove: (predicate: (item: T) => boolean) => void;
  /** Update items matching predicate with partial values */
  update: (predicate: (item: T) => boolean, updates: Partial<T>) => void;
  /** Clear all items */
  clear: () => void;
  /** Replace all items with new array */
  replace: (items: T[]) => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages array state with intent-based operations.
 * Prevents direct state mutation by exposing only controlled methods.
 * 
 * @param initialValue - Initial array value (default: [])
 * @returns Object with items array and mutation methods
 */
export function useArrayState<T>(initialValue: T[] = []): UseArrayStateReturn<T> {
  const [items, setItems] = useState<T[]>(initialValue);

  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const remove = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item)));
  }, []);

  const update = useCallback((predicate: (item: T) => boolean, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      predicate(item) ? { ...item, ...updates } : item
    ));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const replace = useCallback((newItems: T[]) => {
    setItems(newItems);
  }, []);

  return {
    items,
    add,
    remove,
    update,
    clear,
    replace
  };
}
