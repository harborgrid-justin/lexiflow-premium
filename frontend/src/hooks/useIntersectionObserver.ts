/**
 * @module hooks/useIntersectionObserver
 * @category Hooks - Performance
 * 
 * Provides Intersection Observer for lazy loading and visibility tracking.
 * Supports freeze-once-visible mode for one-time triggers.
 * 
 * TEMPORAL COHERENCE (G41):
 * - Encodes visibility-based temporal assumption: entry updates on intersection change
 * - Freeze mode: Once visible, state becomes immutable (temporal boundary)
 * - Identity: Observer persists until frozen or unmounted
 * 
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Entry starts: undefined until first observation
 * - Entry updates: On every intersection change (unless frozen)
 * - Entry freezes: When freezeOnceVisible && isIntersecting
 * - Cleanup: Observer disconnected on unmount or freeze
 * 
 * REF USAGE (G45 - Identity, not data flow):
 * - elementRef: Models IDENTITY of observed element
 * - NOT state: Element reference represents continuity
 * 
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: frozen calculation, hasIOSupport check
 * - Effect boundary: IntersectionObserver registration
 * 
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (IntersectionObserverEntry) not commands
 * - Declarative: Consumers query entry.isIntersecting
 * 
 * SEMANTIC MEMOIZATION (G53):
 * - useCallback on updateEntry for referential stability
 * - Prevents observer recreation on every render
 * 
 * CONCURRENCY SAFETY (G49, G50, G57):
 * - Idempotent: Cleanup prevents multiple observers
 * - Render-count independent: Freeze logic doesn't count renders
 * - Suspense-safe: Synchronous state updates
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
import { useEffect, useState, useCallback } from 'react';

import type React from 'react';

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

  // G42 (PURE COMPUTATION): Synchronous derivation
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  // G53 (SEMANTIC MEMOIZATION): Callback stability prevents observer recreation
  const updateEntry = useCallback(([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
    // EMPTY DEPS (G46): Pure function, no external dependencies
  }, []);

  useEffect(() => {
    const node = elementRef?.current; // DOM Ref
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    // G49 (IDEMPOTENCY): Cleanup prevents multiple observers
    return () => observer.disconnect();
    // CAUSAL DEPENDENCIES (G46):
    // - elementRef: Element identity changes
    // - threshold/root/rootMargin: Observer configuration changes
    // - frozen: Prevents observation once visible
    // - updateEntry: Callback identity (stable via useCallback)
  }, [elementRef, threshold, root, rootMargin, frozen, updateEntry]);

  return entry;
}
