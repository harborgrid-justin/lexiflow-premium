/**
 * useVirtualization.ts
 * Virtual scrolling hook for efficiently rendering large lists
 * Implements windowing technique to only render visible items
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface VirtualizationOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside viewport
  estimatedItemHeight?: number; // For dynamic heights
  horizontal?: boolean; // Horizontal scrolling
}

export interface VirtualItem {
  index: number;
  start: number;
  end: number;
  size: number;
}

export interface VirtualizationResult {
  virtualItems: VirtualItem[];
  totalSize: number;
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end' | 'auto') => void;
  measureElement: (index: number, element: HTMLElement | null) => void;
}

// ============================================================================
// useVirtualization Hook
// ============================================================================

export function useVirtualization(
  itemCount: number,
  options: VirtualizationOptions
): VirtualizationResult {
  const {
    itemHeight,
    containerHeight,
    overscan = 3,
    estimatedItemHeight = itemHeight,
    horizontal = false,
  } = options;

  const [scrollOffset, setScrollOffset] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(new Map());
  const scrollElementRef = useRef<HTMLElement | null>(null);

  // ============================================================================
  // Calculate item positions
  // ============================================================================

  const itemOffsets = useMemo(() => {
    const offsets: number[] = [0];
    for (let i = 0; i < itemCount; i++) {
      const height = measuredHeights.get(i) || estimatedItemHeight;
      offsets.push(offsets[i] + height);
    }
    return offsets;
  }, [itemCount, measuredHeights, estimatedItemHeight]);

  const totalSize = itemOffsets[itemCount] || 0;

  // ============================================================================
  // Binary search to find start index
  // ============================================================================

  const findStartIndex = useCallback(
    (scrollTop: number): number => {
      let low = 0;
      let high = itemCount - 1;

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
    },
    [itemCount, itemOffsets]
  );

  // ============================================================================
  // Calculate visible range
  // ============================================================================

  const getRange = useCallback(() => {
    const scrollTop = scrollOffset;
    const viewportHeight = containerHeight;

    // Find start index
    const startIndex = findStartIndex(scrollTop);

    // Find end index
    let endIndex = startIndex;
    let currentOffset = itemOffsets[startIndex];

    while (currentOffset < scrollTop + viewportHeight && endIndex < itemCount - 1) {
      endIndex++;
      currentOffset = itemOffsets[endIndex + 1];
    }

    // Apply overscan
    const overscanStart = Math.max(0, startIndex - overscan);
    const overscanEnd = Math.min(itemCount - 1, endIndex + overscan);

    return { start: overscanStart, end: overscanEnd };
  }, [scrollOffset, containerHeight, findStartIndex, itemOffsets, itemCount, overscan]);

  // ============================================================================
  // Generate virtual items
  // ============================================================================

  const virtualItems = useMemo((): VirtualItem[] => {
    const range = getRange();
    const items: VirtualItem[] = [];

    for (let i = range.start; i <= range.end; i++) {
      const start = itemOffsets[i];
      const size = measuredHeights.get(i) || estimatedItemHeight;
      const end = start + size;

      items.push({
        index: i,
        start,
        end,
        size,
      });
    }

    return items;
  }, [getRange, itemOffsets, measuredHeights, estimatedItemHeight]);

  // ============================================================================
  // Scroll handler
  // ============================================================================

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    const offset = horizontal ? target.scrollLeft : target.scrollTop;
    setScrollOffset(offset);
  }, [horizontal]);

  // ============================================================================
  // Attach scroll listener
  // ============================================================================

  useEffect(() => {
    const scrollElement = scrollElementRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // ============================================================================
  // Scroll to index
  // ============================================================================

  const scrollToIndex = useCallback(
    (index: number, align: 'start' | 'center' | 'end' | 'auto' = 'auto') => {
      if (!scrollElementRef.current) return;

      const clampedIndex = Math.max(0, Math.min(index, itemCount - 1));
      const offset = itemOffsets[clampedIndex];
      const size = measuredHeights.get(clampedIndex) || estimatedItemHeight;

      let scrollTo = offset;

      switch (align) {
        case 'center':
          scrollTo = offset - containerHeight / 2 + size / 2;
          break;
        case 'end':
          scrollTo = offset - containerHeight + size;
          break;
        case 'auto':
          // Scroll only if not in view
          if (offset < scrollOffset) {
            scrollTo = offset;
          } else if (offset + size > scrollOffset + containerHeight) {
            scrollTo = offset - containerHeight + size;
          } else {
            return; // Already in view
          }
          break;
        // 'start' is default
      }

      if (horizontal) {
        scrollElementRef.current.scrollLeft = scrollTo;
      } else {
        scrollElementRef.current.scrollTop = scrollTo;
      }
    },
    [
      itemCount,
      itemOffsets,
      measuredHeights,
      estimatedItemHeight,
      containerHeight,
      scrollOffset,
      horizontal,
    ]
  );

  // ============================================================================
  // Measure element (for dynamic heights)
  // ============================================================================

  const measureElement = useCallback((index: number, element: HTMLElement | null) => {
    if (!element) return;

    const size = horizontal ? element.offsetWidth : element.offsetHeight;

    setMeasuredHeights(prev => {
      if (prev.get(index) === size) return prev;

      const next = new Map(prev);
      next.set(index, size);
      return next;
    });

    // Store scroll element reference
    if (!scrollElementRef.current) {
      scrollElementRef.current = element.parentElement as HTMLElement;
    }
  }, [horizontal]);

  return {
    virtualItems,
    totalSize,
    scrollToIndex,
    measureElement,
  };
}

// ============================================================================
// useVirtualScroll Hook (simpler API)
// ============================================================================

export interface UseVirtualScrollOptions {
  itemCount: number;
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function useVirtualScroll(options: UseVirtualScrollOptions) {
  const { itemCount, itemHeight, containerHeight, overscan = 3 } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    itemCount - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push({
      index: i,
      top: i * itemHeight,
    });
  }

  const totalHeight = itemCount * itemHeight;

  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll,
  };
}

export default useVirtualization;
