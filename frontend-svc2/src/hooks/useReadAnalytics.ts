/**
 * @module hooks/useReadAnalytics
 * @category Hooks - Analytics
 * 
 * Tracks viewport-based read time with IntersectionObserver.
 * Monitors time spent visible and fires callback after threshold.
 * 
 * @example
 * ```typescript
 * const analytics = useReadAnalytics('article-123', {
 *   thresholdMs: 3000,
 *   onRead: (id, duration) => {
 *     console.log(`Article ${id} read for ${duration}ms`);
 *   }
 * });
 * 
 * <article ref={analytics.ref}>
 *   Content tracked for reading time
 * </article>
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useEffect, useRef, useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Options for read analytics tracking
 */
interface ReadAnalyticsOptions {
  /** Threshold in milliseconds before marking as read */
  thresholdMs?: number;
  /** Callback when threshold is met */
  onRead?: (id: string, duration: number) => void;
}

/**
 * Return type for useReadAnalytics hook
 */
export interface UseReadAnalyticsReturn {
  /** Ref to attach to tracked element */
  ref: React.RefObject<HTMLDivElement>;
  /** Whether threshold has been met */
  isRead: boolean;
  /** Cumulative duration in seconds */
  duration: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Tracks read analytics for viewport-visible content.
 * 
 * @param id - Unique identifier for content
 * @param options - Configuration options
 * @returns Object with ref, isRead flag, and duration
 */
export function useReadAnalytics(
  id: string,
  options: ReadAnalyticsOptions = {}
): UseReadAnalyticsReturn {
    const ref = useRef<HTMLDivElement>(null);
    const [isRead, setIsRead] = useState(false);
    const [duration, setDuration] = useState(0);
    
    // Internal state to track timing
    const startTimeRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);
    const totalDurationRef = useRef(0);
    const onReadRef = useRef(options.onRead);
    const thresholdMsRef = useRef(options.thresholdMs);

    // Keep refs in sync
    useEffect(() => {
        onReadRef.current = options.onRead;
        thresholdMsRef.current = options.thresholdMs;
    }, [options.onRead, options.thresholdMs]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startTimeRef.current = Date.now();
                    // Start tick
                    timerRef.current = window.setInterval(() => {
                        if (startTimeRef.current) {
                           const diff = Date.now() - startTimeRef.current;
                           // Only count up to 60s per session to prevent idle skew
                           if (diff < 60000) {
                               setDuration(d => d + 1);
                               totalDurationRef.current += 1;
                           }
                        }
                    }, 1000);
                } else {
                    if (timerRef.current) clearInterval(timerRef.current);

                    if (startTimeRef.current) {
                        const sessionDuration = Date.now() - startTimeRef.current;
                        const threshold = thresholdMsRef.current || 3000;
                        if (sessionDuration > threshold) {
                            setIsRead(prev => {
                                if (!prev && onReadRef.current) {
                                    onReadRef.current(id, sessionDuration);
                                }
                                return true;
                            });
                        }
                        startTimeRef.current = null;
                    }
                }
            });
        }, { threshold: 0.5 }); // 50% visibility

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            observer.disconnect();
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id]);

    return { ref: ref as React.RefObject<HTMLDivElement>, isRead, duration };
};
