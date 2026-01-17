/**
 * @module hooks/useResizeObserver
 * @category Hooks - UI Utilities
 * 
 * Observes element resize events with ResizeObserver API.
 * Provides current dimensions with automatic cleanup.
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

import { useEffect, useState, type RefObject } from 'react';

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
    
    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, [ref]); // Stable dependency
  
  return dimensions;
};
