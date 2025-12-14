/**
 * @module hooks/useInterval
 * @category Hooks - Timers
 * @description setInterval hook with automatic cleanup and stable callback references. Callback
 * is stored in ref to avoid re-creating interval on every callback change. Supports null delay
 * to pause interval.
 * 
 * NO THEME USAGE: Utility hook for interval timing logic
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import { useEffect, useRef } from 'react';

// ========================================
// HOOK
// ========================================
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
