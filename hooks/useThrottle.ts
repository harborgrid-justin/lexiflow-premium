/**
 * useThrottle Hook
 * Throttles a callback function to limit execution frequency
 */

import { useRef, useCallback, useEffect } from 'react';

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

/**
 * Throttles a callback function
 *
 * @param callback - The function to throttle
 * @param delay - The throttle delay in milliseconds
 * @param options - Throttle options (leading/trailing)
 *
 * @example
 * const handleScroll = useThrottle((event) => {
 *   console.log('Scrolled:', event);
 * }, 200, { leading: true, trailing: true });
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, [handleScroll]);
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: ThrottleOptions = {}
): T {
  const { leading = true, trailing = true } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastCallTimeRef = useRef<number>(0);
  const lastArgsRef = useRef<any[] | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      lastArgsRef.current = args;

      // Leading edge: execute immediately if enough time has passed
      if (leading && timeSinceLastCall >= delay) {
        lastCallTimeRef.current = now;
        callback(...args);
        return;
      }

      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Trailing edge: schedule execution
      if (trailing) {
        timeoutRef.current = setTimeout(() => {
          lastCallTimeRef.current = Date.now();
          if (lastArgsRef.current) {
            callback(...lastArgsRef.current);
          }
          timeoutRef.current = null;
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay, leading, trailing]
  ) as T;

  return throttledCallback;
}

/**
 * Throttles a value
 *
 * @param value - The value to throttle
 * @param delay - The throttle delay in milliseconds
 *
 * @example
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottleValue(scrollY, 200);
 */
export function useThrottleValue<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastUpdateRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;

    if (timeSinceLastUpdate >= delay) {
      lastUpdateRef.current = now;
      setThrottledValue(value);
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        lastUpdateRef.current = Date.now();
        setThrottledValue(value);
      }, delay - timeSinceLastUpdate);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return throttledValue;
}

// Import React for useThrottleValue
import React from 'react';

export default useThrottle;
