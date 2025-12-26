/**
 * @module hooks/useResizeObserver
 * @category Hooks - UI Utilities
 * @description Custom hook for observing element resize events
 * 
 * BEST PRACTICES:
 * - Custom hook for reusability (Practice #3)
 * - Strict effect management with proper cleanup (Practice #9)
 * - Type-safe architecture (Practice #5)
 */

import { useEffect, useRef, useState, RefObject } from 'react';

export interface Dimensions {
  width: number;
  height: number;
}

/**
 * Hook to observe element dimensions using ResizeObserver
 * @param ref - Reference to element to observe
 * @returns Current dimensions of the element
 */
export const useResizeObserver = <T extends HTMLElement>(
  ref: RefObject<T>
): Dimensions => {
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
