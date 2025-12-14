/**
 * @module hooks/useVirtualizedDocket
 * @category Hooks - Performance
 * @description Custom virtualization hook with dynamic height estimation and row measurement caching
 * Optimized for large dockets (1000+ entries) with smooth scrolling
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface VirtualizedDocketConfig<T> {
  items: T[];
  estimatedItemHeight: number;
  overscan?: number; // Number of items to render outside visible area
  containerHeight?: number | string;
}

export interface VirtualizedDocketResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    start: number;
    size: number;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  measureElement: (index: number, element: HTMLElement) => void;
}

// ============================================================================
// HOOK
// ============================================================================

export function useVirtualizedDocket<T>({
  items,
  estimatedItemHeight,
  overscan = 5,
  containerHeight = '100%'
}: VirtualizedDocketConfig<T>): VirtualizedDocketResult<T> {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightPx, setContainerHeightPx] = useState(600);
  
  // Cache for measured heights
  const measurementsRef = useRef<Map<number, number>>(new Map());
  
  // Container ref for imperative scrolling
  const scrollElementRef = useRef<HTMLElement | null>(null);
  
  /**
   * Get height for a specific index (measured or estimated)
   */
  const getItemHeight = useCallback((index: number): number => {
    return measurementsRef.current.get(index) ?? estimatedItemHeight;
  }, [estimatedItemHeight]);
  
  /**
   * Calculate total height of all items
   */
  const totalHeight = useMemo(() => {
    let height = 0;
    for (let i = 0; i < items.length; i++) {
      height += getItemHeight(i);
    }
    return height;
  }, [items.length, getItemHeight]);
  
  /**
   * Calculate cumulative offsets for all items
   */
  const itemOffsets = useMemo(() => {
    const offsets: number[] = [0];
    for (let i = 0; i < items.length; i++) {
      offsets.push(offsets[i] + getItemHeight(i));
    }
    return offsets;
  }, [items.length, getItemHeight]);
  
  /**
   * Find the first visible item using binary search
   */
  const findStartIndex = useCallback((scrollTop: number): number => {
    let low = 0;
    let high = items.length - 1;
    
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const offset = itemOffsets[mid];
      
      if (offset === scrollTop) {
        return mid;
      } else if (offset < scrollTop) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    
    return Math.max(0, low - 1);
  }, [items.length, itemOffsets]);
  
  /**
   * Calculate visible range with overscan
   */
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, findStartIndex(scrollTop) - overscan);
    
    let endIndex = startIndex;
    let currentHeight = 0;
    const targetHeight = scrollTop + containerHeightPx + (estimatedItemHeight * overscan);
    
    while (endIndex < items.length && itemOffsets[endIndex] < targetHeight) {
      endIndex++;
    }
    
    endIndex = Math.min(items.length - 1, endIndex + overscan);
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeightPx, findStartIndex, items.length, overscan, estimatedItemHeight, itemOffsets]);
  
  /**
   * Get virtual items to render
   */
  const virtualItems = useMemo(() => {
    const { startIndex, endIndex } = visibleRange;
    const result = [];
    
    for (let i = startIndex; i <= endIndex; i++) {
      if (i >= items.length) break;
      
      result.push({
        index: i,
        item: items[i],
        start: itemOffsets[i],
        size: getItemHeight(i)
      });
    }
    
    return result;
  }, [visibleRange, items, itemOffsets, getItemHeight]);
  
  /**
   * Measure element callback
   */
  const measureElement = useCallback((index: number, element: HTMLElement) => {
    if (!element) return;
    
    const height = element.getBoundingClientRect().height;
    const currentHeight = measurementsRef.current.get(index);
    
    // Only update if height has changed significantly (avoid re-renders for tiny differences)
    if (!currentHeight || Math.abs(currentHeight - height) > 1) {
      measurementsRef.current.set(index, height);
      // Force recalculation on next render
      setScrollTop(prev => prev);
    }
  }, []);
  
  /**
   * Scroll to specific index
   */
  const scrollToIndex = useCallback((index: number) => {
    if (!scrollElementRef.current) return;
    
    const offset = itemOffsets[Math.min(index, items.length - 1)];
    scrollElementRef.current.scrollTop = offset;
  }, [itemOffsets, items.length]);
  
  /**
   * Setup scroll listener
   */
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      setScrollTop(target.scrollTop);
      scrollElementRef.current = target;
    };
    
    // Attach to scrollable parent
    const scrollContainer = document.querySelector('[data-docket-scroll]') as HTMLElement;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      scrollElementRef.current = scrollContainer;
      
      // Initial container height measurement
      setContainerHeightPx(scrollContainer.clientHeight);
      
      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  /**
   * Update container height on resize
   */
  useEffect(() => {
    const handleResize = () => {
      if (scrollElementRef.current) {
        setContainerHeightPx(scrollElementRef.current.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  /**
   * Clear measurements when items change
   */
  useEffect(() => {
    measurementsRef.current.clear();
  }, [items.length]);
  
  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    measureElement
  };
}
