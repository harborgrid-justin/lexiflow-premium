import { useCallback, useRef } from "react";

/**
 * Hook to track interaction latency.
 * (Principle 2: Interaction Latency Budget)
 */
export function useInteractionMetric(componentName: string, budgetMs = 100) {
  const startTimeRef = useRef<number | null>(null);

  const startInteraction = useCallback(() => {
    startTimeRef.current = performance.now();
  }, []);

  const endInteraction = useCallback(() => {
    if (startTimeRef.current) {
      const duration = performance.now() - startTimeRef.current;
      if (duration > budgetMs) {
        console.warn(
          `[Performance] ${componentName} interaction exceeded budget: ${duration.toFixed(2)}ms > ${budgetMs}ms`
        );
        // In a real app, report to analytics/monitoring here
      }
      startTimeRef.current = null;
    }
  }, [componentName, budgetMs]);

  return { startInteraction, endInteraction };
}
