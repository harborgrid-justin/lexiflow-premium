import { useEffect, useRef, useState } from "react";

/**
 * Hook to ensure a loading state is displayed for a minimum duration
 * to prevent flickering (Principle 4: Deterministic Loading States).
 *
 * @param isLoading - The actual loading state from data fetching
 * @param minDuration - Minimum time in ms to show loading state (default 200ms)
 * @param delay - Delay before showing loading state (default 0ms) - "No flash of skeleton for fast requests"
 */
export function useMinDisplayTime(
  isLoading: boolean,
  minDuration = 200,
  delay = 0
) {
  const [shouldShowLoading, setShouldShowLoading] = useState(false);
  const startTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isLoading) {
      // Start loading
      if (!startTimeRef.current) {
        // If we have a delay, wait before showing loading
        if (delay > 0) {
          timeoutRef.current = setTimeout(() => {
            startTimeRef.current = Date.now();
            setShouldShowLoading(true);
          }, delay);
        } else {
          startTimeRef.current = Date.now();
          setShouldShowLoading(true);
        }
      }
    } else {
      // Stop loading
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        const remaining = minDuration - elapsed;

        if (remaining > 0) {
          // Keep showing loading until minDuration is met
          timeoutRef.current = setTimeout(() => {
            setShouldShowLoading(false);
            startTimeRef.current = null;
          }, remaining);
        } else {
          setShouldShowLoading(false);
          startTimeRef.current = null;
        }
      } else {
        setShouldShowLoading(false);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, minDuration, delay]);

  return shouldShowLoading;
}
