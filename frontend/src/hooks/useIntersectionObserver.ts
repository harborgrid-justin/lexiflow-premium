/**
 * @module hooks/useIntersectionObserver
 * @category Hooks - Performance
 * 
 * Provides Intersection Observer for lazy loading and visibility tracking.
 * Supports freeze-once-visible mode for one-time triggers.
 * 
 * @example
 * ```typescript
 * const elementRef = useRef<HTMLDivElement>(null);
 * const entry = useIntersectionObserver(elementRef, {
 *   threshold: 0.5,
 *   freezeOnceVisible: true
 * });
 * 
 * const isVisible = entry?.isIntersecting;
 * ```
 */

// ========================================
// EXTERNAL DEPENDENCIES
// ========================================
import React, { useEffect, useState, useCallback } from 'react';

// ========================================
// TYPES & INTERFACES
// ========================================

/**
 * Options for Intersection Observer
 */
interface IntersectionObserverArgs extends IntersectionObserverInit {
  /** Freeze state once element becomes visible */
  freezeOnceVisible?: boolean;
}

// ========================================
// HOOK
// ========================================

/**
 * Observes element intersection with viewport.
 * 
 * @param elementRef - Reference to element to observe
 * @param options - Observer configuration
 * @returns Current intersection entry or undefined
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  }: IntersectionObserverArgs
): IntersectionObserverEntry | undefined {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  }, []);

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen, updateEntry]);

  return entry;
}
