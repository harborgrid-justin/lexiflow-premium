/**
 * @module hooks/usePerformanceTracking
 * @category Hooks - Performance
 *
 * Tracks component render performance with memory monitoring.
 * Warns when renders exceed threshold.
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   usePerformanceTracking({
 *     componentName: 'MyComponent',
 *     warnThreshold: 16, // Warn if render > 16ms
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */

import { memoryMonitor } from "@/utils/memoryMonitor";
import { useEffect, useRef } from "react";

/**
 * Options for performance tracking
 */
export interface PerformanceTrackingOptions {
  /** Component name for logging */
  componentName: string;
  /** Enable tracking (default: dev mode only) */
  enabled?: boolean;
  /** Warn threshold in milliseconds */
  warnThreshold?: number;
}

/**
 * Tracks component render performance.
 *
 * @param options - Configuration options
 */
export function usePerformanceTracking(
  options: PerformanceTrackingOptions
): void {
  const {
    componentName,
    enabled = import.meta.env.DEV ||
      process.env.NEXT_PUBLIC_ENABLE_PERF_TRACKING === "true",
    warnThreshold = 16,
  } = options;

  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartRef.current = performance.now();
    renderCountRef.current++;
    const currentRenderCount = renderCountRef.current;

    return () => {
      const duration = performance.now() - renderStartRef.current;
      memoryMonitor.trackRender(componentName, duration);

      if (duration > warnThreshold) {
        console.warn(
          `[Performance] ${componentName} render #${currentRenderCount} took ${duration.toFixed(2)}ms`
        );
      }
    };
  });
}

/**
 * Hook to track expensive computation
 *
 * @example
 * ```tsx
 * const expensiveValue = useTrackedMemo(
 *   () => heavyComputation(data),
 *   'heavyComputation'
 * );
 * ```
 */
export function useTrackedMemo<T>(factory: () => T, name: string): T {
  const startTime = performance.now();
  const value = factory();
  const duration = performance.now() - startTime;

  if (duration > 10) {
    console.warn(
      `[Performance] Expensive memo "${name}" took ${duration.toFixed(2)}ms`
    );
  }

  return value;
}
