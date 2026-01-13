/**
 * @module hooks/useInterval
 * @category Hooks - Timing
 * 
 * Enterprise-grade interval timing with automatic cleanup.
 * Provides stable callback references and pause/resume support.
 * 
 * TEMPORAL COHERENCE (G41):
 * - Encodes periodic temporal assumption: callback fires every `delay` ms
 * - Identity: interval ID persists across renders until delay changes
 * - Lifecycle: interval created on delay change, destroyed on unmount/delay change
 * 
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Interval starts: On mount if delay is non-null
 * - Interval pauses: When delay becomes null
 * - Interval resets: When delay value changes
 * - Interval stops: On unmount (guaranteed cleanup)
 * 
 * REF USAGE (G45 - Identity, not data flow):
 * - savedCallback: Models IDENTITY of latest callback (not state)
 * - Ensures interval always invokes current callback without recreating timer
 * - Preserves continuity: same interval ID, different callback over time
 * 
 * CONCURRENCY SAFETY (G49, G50, G57):
 * - Idempotent: StrictMode double-invoke cleans up first interval
 * - Render-count independent: No assumptions about render frequency
 * - Suspense-safe: No synchronous completion expectations
 * 
 * @example
 * ```typescript
 * // Basic interval
 * useInterval(() => {
 *   console.log('Tick');
 * }, 1000);
 * 
 * // Conditional interval (pause when null)
 * const [isPaused, setIsPaused] = useState(false);
 * useInterval(() => {
 *   fetchData();
 * }, isPaused ? null : 5000);
 * ```
 */

// =============================================================================
// EXTERNAL DEPENDENCIES
// =============================================================================
import { useEffect, useRef } from 'react';

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Validate callback parameter
 * @private
 */
function validateCallback(callback: unknown): void {
  if (typeof callback !== 'function') {
    throw new Error('[useInterval] Callback must be a function');
  }
}

/**
 * Validate delay parameter
 * @private
 */
function validateDelay(delay: unknown): void {
  if (delay !== null && (typeof delay !== 'number' || delay < 0)) {
    throw new Error('[useInterval] Delay must be a positive number or null');
  }
}

// =============================================================================
// HOOK
// =============================================================================

/**
 * React hook for managing intervals with automatic cleanup
 * 
 * @param callback - Function to call on each interval tick
 * @param delay - Delay in milliseconds (null to pause)
 * @throws Error if callback is not a function or delay is invalid
 * 
 * @example
 * // Auto-refresh data every 30 seconds
 * useInterval(() => {
 *   refetchData();
 * }, 30000);
 * 
 * @example
 * // Countdown timer
 * const [seconds, setSeconds] = useState(60);
 * useInterval(() => {
 *   setSeconds(s => s > 0 ? s - 1 : 0);
 * }, 1000);
 * 
 * @algorithm
 * 1. Store callback in ref (updated on every render)
 * 2. On delay change:
 *    a. If delay is null ? clear interval and return
 *    b. Otherwise ? create new interval with ref-based tick function
 * 3. On unmount or delay change ? clear previous interval
 * 
 * @performance
 * - Interval only recreated when delay changes (not on callback change)
 * - useRef prevents stale closures without dependency overhead
 * - Single interval ID per hook instance
 * 
 * @cleanup
 * - Interval automatically cleared on unmount
 * - Interval cleared when delay changes
 * - Interval cleared when delay becomes null
 */
export function useInterval(callback: () => void, delay: number | null): void {
  // Validate inputs
  if (process.env.NODE_ENV !== 'production') {
    validateCallback(callback);
    validateDelay(delay);
  }

  const savedCallback = useRef(callback);

  /**
   * Remember the latest callback without recreating interval
   * G45 (REF IDENTITY): savedCallback models continuity of callback identity
   * across renders, NOT data flow. This preserves interval stability while
   * allowing callback logic to change.
   */
  useEffect(() => {
    savedCallback.current = callback;
    // CAUSAL DEPENDENCY (G46): callback changes update ref identity
  }, [callback]);

  /**
   * Set up the interval with automatic cleanup
   * G49 (IDEMPOTENCY): Safe under re-execution - cleanup function prevents
   * multiple concurrent intervals in StrictMode
   * G50 (RENDER COUNT): Independent of render frequency
   */
  useEffect(() => {
    /**
     * Tick function that calls the latest callback from ref
     * Always executes the current callback, not the one from closure
     */
    function tick(): void {
      savedCallback.current();
    }

    // Only create interval if delay is not null (pause mechanism)
    if (delay !== null) {
      const intervalId = setInterval(tick, delay);
      
      // Cleanup function: clear interval on unmount or delay change
      return () => {
        clearInterval(intervalId);
      };
    }

    // Return empty cleanup function when paused (delay === null)
    return () => {};
  }, [delay]);
}
