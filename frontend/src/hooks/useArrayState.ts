/**
 * useArrayState.ts
 * 
 * Reusable hook for managing array state with common operations
 * Replaces 50+ instances of useState<T[]>([])
 */

import { useState, useCallback, Dispatch, SetStateAction } from 'react';

export interface UseArrayStateReturn<T> {
  items: T[];
  setItems: Dispatch<SetStateAction<T[]>>;
  add: (item: T) => void;
  remove: (predicate: (item: T) => boolean) => void;
  update: (predicate: (item: T) => boolean, updates: Partial<T>) => void;
  clear: () => void;
  replace: (items: T[]) => void;
}

/**
 * useArrayState - Unified array state management with helpers
 * 
 * @example
 * ```tsx
 * const todos = useArrayState<Todo>([]);
 * 
 * todos.add({ id: '1', title: 'New task', done: false });
 * todos.update(t => t.id === '1', { done: true });
 * todos.remove(t => t.id === '1');
 * ```
 */
export const useArrayState = <T>(initialValue: T[] = []): UseArrayStateReturn<T> => {
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
    setItems,
    add,
    remove,
    update,
    clear,
    replace
  };
};
