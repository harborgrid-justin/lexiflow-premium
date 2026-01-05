import { useCallback } from "react";

/**
 * Hook to trigger predictive pre-loading on user intent (hover/focus).
 * (Principle 14: Predictive Pre-Rendering)
 */
export function usePredictivePreload(preloadFn: () => void) {
  const handleInteraction = useCallback(() => {
    // Use requestIdleCallback if available to not block main thread
    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (callback: () => void) => void;
        }
      ).requestIdleCallback(() => {
        preloadFn();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(preloadFn, 1);
    }
  }, [preloadFn]);

  return {
    onMouseEnter: handleInteraction,
    onFocus: handleInteraction,
    onTouchStart: handleInteraction, // For mobile
  };
}
