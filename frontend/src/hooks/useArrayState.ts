/**
 * @module hooks/useArrayState
 * @category Hooks - State Management
 * 
 * Manages array state with intent-based operations.
 * Provides type-safe methods for common array mutations.
 * 
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (items) + declarative actions (add, remove, update)
 * - NOT action-oriented: Provides array data + mutation controls
 * - Declarative: Consumers query items and invoke intent-based operations
 * 
 * STABLE CONTRACT (G43):
 * - Public API: { items, add, remove, update, clear, replace }
 * - Implementation can change (useState → useReducer → Immer) without breaking consumers
 * - Referential stability: All methods memoized via useCallback
 * 
 * PURE COMPUTATION (G42):
 * - All mutations use immutable patterns (map, filter, spread)
 * - No side effects: Pure array transformations
 * 
 * SEMANTIC MEMOIZATION (G53):
 * - useCallback ensures methods are referentially stable
 * - Semantic intent: Methods should be stable when passed as props
 * - NOT for micro-optimization: Prevents child re-renders
 * 
 * CONCURRENCY SAFETY (G49, G50):
 * - Idempotent: Functional state updates prevent accumulation
 * - Render-count independent: No internal render tracking
 * 
 * DOMAIN PRIMITIVE (G48):
 * - Encodes array manipulation semantics
 * - Abstracts mutation patterns from components
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
 * G53 (SEMANTIC MEMOIZATION): All methods memoized for referential stability
 * G49 (IDEMPOTENCY): Functional updates safe under re-execution
 * 
 * @param initialValue - Initial array value (default: [])
 * @returns Object with items array and mutation methods
 */
export function useArrayState<T>(initialValue: T[] = []): UseArrayStateReturn<T> {
  const [items, setItems] = useState<T[]>(initialValue);

  // G53: Memoized for semantic stability, not micro-optimization
  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]); // G42: Pure immutable operation
    // EMPTY DEPS (G46): Pure operation, no external dependencies
  }, []);

  const remove = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item))); // G42: Pure filter
    // EMPTY DEPS (G46): Predicate passed as parameter
  }, []);

  const update = useCallback((predicate: (item: T) => boolean, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      predicate(item) ? { ...item, ...updates } : item // G42: Pure map
    ));
    // EMPTY DEPS (G46): Parameters passed, no closures
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    // EMPTY DEPS (G46): Pure reset operation
  }, []);

  const replace = useCallback((newItems: T[]) => {
    setItems(newItems);
    // EMPTY DEPS (G46): Parameter-driven operation
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
