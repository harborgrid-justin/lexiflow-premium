/**
 * React Performance Hook with Memory Tracking
 * Production-ready hook for tracking component performance
 * 
 * @module hooks/usePerformanceTracking
 */

import { useEffect, useRef } from 'react';
import { memoryMonitor } from '../utils/memoryMonitor';

export interface PerformanceTrackingOptions {
  componentName: string;
  enabled?: boolean;
  warnThreshold?: number; // milliseconds
}

/**
 * Hook to track component render performance
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   usePerformanceTracking({
 *     componentName: 'MyComponent',
 *     warnThreshold: 16, // Warn if render takes > 16ms
 *   });
 *   
 *   return <div>...</div>;
 * }
 * ```
 */
export function usePerformanceTracking(options: PerformanceTrackingOptions): void {
  const {
    componentName,
    enabled = import.meta.env.DEV || import.meta.env.VITE_ENABLE_PERF_TRACKING === 'true',
    warnThreshold = 16,
  } = options;

  const renderStartRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    renderStartRef.current = performance.now();
    renderCountRef.current++;

    return () => {
      const duration = performance.now() - renderStartRef.current;
      memoryMonitor.trackRender(componentName, duration);

      if (duration > warnThreshold) {
        console.warn(
          `[Performance] ${componentName} render #${renderCountRef.current} took ${duration.toFixed(2)}ms`
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
 *   [data],
 *   'heavyComputation'
 * );
 * ```
 */
export function useTrackedMemo<T>(
  factory: () => T,
  deps: React.DependencyList,
  name: string
): T {
  const startTime = performance.now();
  const value = factory();
  const duration = performance.now() - startTime;

  if (duration > 10) {
    console.warn(`[Performance] Expensive memo "${name}" took ${duration.toFixed(2)}ms`);
  }

  return value;
}
