/**
 * @module hooks/useDebounce
 * @category Hooks - Performance
 * 
 * Provides value and callback debouncing to reduce unnecessary re-renders and API calls.
 * 
 * TEMPORAL COHERENCE (G41):
 * - Encodes delay-based temporal assumptions: values stabilize after `delay` milliseconds
 * - Timer resets on each value change, creating sliding window behavior
 * - Identity assumption: delay changes reconstruct timer, not just adjust it
 * 
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Values stabilize: After `delay` ms of inactivity
 * - Values reset: On every input value change
 * - Values persist: Across renders until next change
 * - Cleanup guarantee: Timer cleared on unmount via effect cleanup
 * 
 * CONCURRENCY SAFETY (G49, G50, G57):
 * - Idempotent under re-execution: Multiple renders don't create multiple timers
 * - Render count independent: Works in StrictMode double-invoke
 * - Suspense-safe: No assumptions about synchronous completion
 * 
 * @example
 * ```typescript
 * // Debounce search term
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * // Debounce callback
 * const debouncedSave = useDebouncedCallback(
 *   (data) => saveToApi(data),
 *   500
 * );
 * ```
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useState, useEffect, useCallback, useRef } from 'react';

// ========================================
// HOOK - VALUE DEBOUNCING
// ========================================

/**
 * Debounces a value, updating only after the specified delay.
 * Useful for search inputs and real-time filtering.
 * 
 * @param value - Value to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
    // CAUSAL DEPENDENCIES (G46):
    // - value: Changes trigger timer reset (sliding window behavior)
    // - delay: Changes reconstruct timer with new duration
  }, [value, delay]);

  return debouncedValue;
}

// ========================================
// HOOK - CALLBACK DEBOUNCING
// ========================================

/**
 * Return type for useDebouncedCallback
 */
export type DebouncedCallback<T extends (...args: unknown[]) => void> = 
  (...args: Parameters<T>) => void;

/**
 * Debounces a callback function, executing only after the specified delay.
 * Useful for expensive operations like API calls or complex computations.
 * 
 * REF USAGE (G45 - Identity, not data flow):
 * - timeoutRef: Models IDENTITY of pending timeout across renders (continuity)
 * - callbackRef: Models IDENTITY of latest callback (stable reference for timeout)
 * - NOT for state: Refs bypass React reconciliation, avoid using for data flow
 * 
 * SEMANTIC MEMOIZATION (G53):
 * - useCallback ensures referential stability for consumers
 * - Prevents child component re-renders when callback identity matters
 * - NOT for micro-optimization: semantic intent is reference stability
 * 
 * @param callback - Function to debounce
 * @param delay - Debounce delay in milliseconds
 * @returns Debounced callback function
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): DebouncedCallback<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes (G45: identity continuity)
  useEffect(() => {
    callbackRef.current = callback;
    // CAUSAL DEPENDENCY (G46): callback changes update ref identity
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}
