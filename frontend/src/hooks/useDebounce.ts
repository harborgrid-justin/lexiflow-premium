/**
 * @module hooks/useDebounce
 * @category Hooks - Performance
 * 
 * Provides value and callback debouncing to reduce unnecessary re-renders and API calls.
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

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
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
