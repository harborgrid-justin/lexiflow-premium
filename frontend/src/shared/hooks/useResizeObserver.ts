/**
 * @module hooks/useResizeObserver
 * @category Hooks - UI Utilities
 * 
 * Observes element resize events with ResizeObserver API.
 * Provides current dimensions with automatic cleanup.
 * 
 * TEMPORAL COHERENCE (G41):
 * - Encodes resize-based temporal assumption: dimensions update on element resize
 * - Identity: Observer instance persists across renders
 * - Lifecycle: Observer created on mount, destroyed on unmount
 * 
 * LIFECYCLE ASSUMPTIONS (G58):
 * - Dimensions initialize: { width: 0, height: 0 } until first measurement
 * - Dimensions update: On every element resize event
 * - Dimensions persist: Current value until next resize
 * - Cleanup: Observer disconnected on unmount or ref change
 * 
 * PURE COMPUTATION + EFFECT BOUNDARY (G42):
 * - Pure: Dimensions are synchronous state
 * - Effect boundary: ResizeObserver registration
 * - No render-phase side effects
 * 
 * DATA-ORIENTED RETURNS (G44):
 * - Returns STATE (dimensions) not commands
 * - Declarative: { width, height } data structure
 * 
 * CONCURRENCY SAFETY (G49, G50, G57):
 * - Idempotent: Effect cleanup prevents multiple observers
 * - Render-count independent: Doesn't assume render frequency
 * - Suspense-safe: Synchronous state updates
 * 
 * @example
 * ```typescript
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { width, height } = useResizeObserver(containerRef);
 * 
 * <div ref={containerRef}>
 *   Size: {width}x{height}
 * </div>
 * ```
 */

import { useEffect, useState, RefObject } from 'react';

/**
 * Dimensions interface
 */
export interface Dimensions {
  /** Width in pixels */
  width: number;
  /** Height in pixels */
  height: number;
}

/**
 * Observes element dimensions using ResizeObserver.
 * 
 * @param ref - Reference to element to observe
 * @returns Current dimensions of the element
 */
export function useResizeObserver<T extends HTMLElement>(
  ref: RefObject<T>
): Dimensions {
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry?.contentRect) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    
    observer.observe(element);
    
    // G49 (IDEMPOTENCY): Cleanup prevents multiple observers in StrictMode
    return () => {
      observer.disconnect();
    };
    // CAUSAL DEPENDENCIES (G46):
    // - ref: Changes when element identity changes
    // - Effect re-runs to observe new element
  }, [ref]);
  
  return dimensions;
};
