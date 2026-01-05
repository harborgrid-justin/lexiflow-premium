/**
 * @module hooks/useVirtualList
 * @category Hooks - Performance
 *
 * Virtual scrolling/windowing hooks for rendering large lists efficiently.
 * Only renders visible items to improve performance and reduce memory usage.
 *
 * @example
 * ```tsx
 * function LargeList({ items }: Props) {
 *   const {
 *     virtualItems,
 *     totalHeight,
 *     containerRef,
 *   } = useVirtualList({
 *     itemCount: items.length,
 *     itemHeight: 50,
 *     containerHeight: 600,
 *   });
 *
 *   return (
 *     <div ref={containerRef} style={{ height: 600, overflow: 'auto' }}>
 *       <div style={{ height: totalHeight, position: 'relative' }}>
 *         {virtualItems.map(item => (
 *           <div
 *             key={item.index}
 *             style={{
 *               position: 'absolute',
 *               top: item.offsetTop,
 *               height: item.height,
 *             }}
 *           >
 *             {items[item.index].name}
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

/**
 * Virtual item interface
 */
export interface VirtualItem {
  /** Item index in the original array */
  index: number;
  /** Offset from top in pixels */
  offsetTop: number;
  /** Item height in pixels */
  height: number;
  /** Is currently visible */
  isVisible: boolean;
}

/**
 * Virtual list configuration
 */
export interface VirtualListConfig {
  /** Total number of items */
  itemCount: number;
  /** Height of each item (fixed) or function for dynamic heights */
  itemHeight: number | ((index: number) => number);
  /** Container height in pixels */
  containerHeight: number;
  /** Number of items to render outside viewport (overscan) */
  overscan?: number;
  /** Enable smooth scrolling */
  smoothScroll?: boolean;
  /** Scroll event throttle in ms */
  scrollThrottle?: number;
}

/**
 * Virtual list state
 */
export interface VirtualListState {
  /** Virtual items to render */
  virtualItems: VirtualItem[];
  /** Total height of all items */
  totalHeight: number;
  /** Ref for container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Scroll to index */
  scrollToIndex: (index: number, options?: ScrollToOptions) => void;
  /** Scroll to offset */
  scrollToOffset: (offset: number) => void;
  /** Get current scroll offset */
  getScrollOffset: () => number;
}

/**
 * Scroll to options
 */
export interface ScrollToOptions {
  /** Alignment: start, center, end, auto */
  align?: 'start' | 'center' | 'end' | 'auto';
  /** Smooth scroll behavior */
  behavior?: 'auto' | 'smooth';
}

/**
 * Virtual list hook for fixed-height items
 *
 * Efficiently renders large lists by only rendering visible items.
 * Supports scroll to index and overscan for smoother scrolling.
 *
 * @param config - Virtual list configuration
 * @returns Virtual list state and controls
 *
 * @example
 * ```tsx
 * function DocumentList({ documents }: Props) {
 *   const {
 *     virtualItems,
 *     totalHeight,
 *     containerRef,
 *     scrollToIndex,
 *   } = useVirtualList({
 *     itemCount: documents.length,
 *     itemHeight: 60,
 *     containerHeight: 800,
 *     overscan: 5,
 *   });
 *
 *   return (
 *     <div>
 *       <button onClick={() => scrollToIndex(100)}>
 *         Scroll to item 100
 *       </button>
 *       <div ref={containerRef} style={{ height: 800, overflow: 'auto' }}>
 *         <div style={{ height: totalHeight, position: 'relative' }}>
 *           {virtualItems.map(item => (
 *             <DocumentRow
 *               key={item.index}
 *               document={documents[item.index]}
 *               style={{
 *                 position: 'absolute',
 *                 top: item.offsetTop,
 *                 height: item.height,
 *               }}
 *             />
 *           ))}
 *         </div>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVirtualList(config: VirtualListConfig): VirtualListState {
  const {
    itemCount,
    itemHeight,
    containerHeight,
    overscan = 3,
    scrollThrottle = 16,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Calculate item heights
  const getItemHeight = useCallback(
    (index: number): number => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  // Calculate total height and item offsets
  const { totalHeight, itemOffsets } = useMemo(() => {
    const offsets: number[] = [];
    let total = 0;

    for (let i = 0; i < itemCount; i++) {
      offsets.push(total);
      total += getItemHeight(i);
    }

    return { totalHeight: total, itemOffsets: offsets };
  }, [itemCount, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const scrollTop = scrollOffset;
    const scrollBottom = scrollOffset + containerHeight;

    // Binary search for start index
    let startIndex = 0;
    let endIndex = itemCount - 1;

    while (startIndex <= endIndex) {
      const mid = Math.floor((startIndex + endIndex) / 2);
      const midOffset = itemOffsets[mid] || 0;

      if (midOffset < scrollTop) {
        startIndex = mid + 1;
      } else {
        endIndex = mid - 1;
      }
    }

    startIndex = Math.max(0, startIndex - overscan);

    // Find end index
    let visibleEndIndex = startIndex;
    while (
      visibleEndIndex < itemCount &&
      (itemOffsets[visibleEndIndex] || 0) < scrollBottom
    ) {
      visibleEndIndex++;
    }

    const endIdx = Math.min(itemCount - 1, visibleEndIndex + overscan);

    return { start: startIndex, end: endIdx };
  }, [scrollOffset, containerHeight, itemCount, itemOffsets, overscan]);

  // Generate virtual items
  const virtualItems = useMemo<VirtualItem[]>(() => {
    const items: VirtualItem[] = [];

    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      items.push({
        index: i,
        offsetTop: itemOffsets[i] || 0,
        height: getItemHeight(i),
        isVisible: true,
      });
    }

    return items;
  }, [visibleRange, itemOffsets, getItemHeight]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setScrollOffset(container.scrollTop);
      }, scrollThrottle);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [scrollThrottle]);

  // Scroll to index function
  const scrollToIndex = useCallback(
    (index: number, options: ScrollToOptions = {}) => {
      const container = containerRef.current;
      if (!container) return;

      const { align = 'start', behavior = 'smooth' } = options;
      const offset = itemOffsets[index] || 0;
      const itemHeightVal = getItemHeight(index);

      let scrollTop = offset;

      if (align === 'center') {
        scrollTop = offset - containerHeight / 2 + itemHeightVal / 2;
      } else if (align === 'end') {
        scrollTop = offset - containerHeight + itemHeightVal;
      } else if (align === 'auto') {
        const currentScroll = container.scrollTop;
        if (offset < currentScroll) {
          scrollTop = offset;
        } else if (offset + itemHeightVal > currentScroll + containerHeight) {
          scrollTop = offset - containerHeight + itemHeightVal;
        } else {
          return; // Already visible
        }
      }

      container.scrollTo({
        top: Math.max(0, Math.min(scrollTop, totalHeight - containerHeight)),
        behavior,
      });
    },
    [itemOffsets, getItemHeight, containerHeight, totalHeight]
  );

  // Scroll to offset function
  const scrollToOffset = useCallback(
    (offset: number) => {
      const container = containerRef.current;
      if (!container) return;

      container.scrollTo({
        top: Math.max(0, Math.min(offset, totalHeight - containerHeight)),
        behavior: 'smooth',
      });
    },
    [totalHeight, containerHeight]
  );

  // Get current scroll offset
  const getScrollOffset = useCallback(() => {
    return containerRef.current?.scrollTop || 0;
  }, []);

  return {
    virtualItems,
    totalHeight,
    containerRef,
    scrollToIndex,
    scrollToOffset,
    getScrollOffset,
  };
}

/**
 * Virtual grid hook for 2D virtualization
 *
 * Virtualizes both rows and columns for grid layouts.
 *
 * @param config - Grid configuration
 * @returns Virtual grid state
 *
 * @example
 * ```tsx
 * function ImageGrid({ images }: Props) {
 *   const {
 *     virtualItems,
 *     totalHeight,
 *     containerRef,
 *   } = useVirtualGrid({
 *     rowCount: Math.ceil(images.length / 4),
 *     columnCount: 4,
 *     rowHeight: 200,
 *     columnWidth: 200,
 *     containerHeight: 800,
 *     containerWidth: 800,
 *   });
 *
 *   return (
 *     <div ref={containerRef} style={{ height: 800, width: 800, overflow: 'auto' }}>
 *       <div style={{ height: totalHeight, position: 'relative' }}>
 *         {virtualItems.map(item => {
 *           const imageIndex = item.row * 4 + item.column;
 *           return (
 *             <img
 *               key={`${item.row}-${item.column}`}
 *               src={images[imageIndex]?.url}
 *               style={{
 *                 position: 'absolute',
 *                 top: item.offsetTop,
 *                 left: item.offsetLeft,
 *                 width: item.width,
 *                 height: item.height,
 *               }}
 *             />
 *           );
 *         })}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useVirtualGrid(config: {
  rowCount: number;
  columnCount: number;
  rowHeight: number;
  columnWidth: number;
  containerHeight: number;
  containerWidth: number;
  overscan?: number;
}): {
  virtualItems: Array<{
    row: number;
    column: number;
    offsetTop: number;
    offsetLeft: number;
    width: number;
    height: number;
  }>;
  totalHeight: number;
  totalWidth: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
} {
  const {
    rowCount,
    columnCount,
    rowHeight,
    columnWidth,
    containerHeight,
    containerWidth,
    overscan = 2,
  } = config;

  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const totalHeight = rowCount * rowHeight;
  const totalWidth = columnCount * columnWidth;

  // Calculate visible rows
  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    rowCount - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  // Calculate visible columns
  const startCol = Math.max(0, Math.floor(scrollLeft / columnWidth) - overscan);
  const endCol = Math.min(
    columnCount - 1,
    Math.ceil((scrollLeft + containerWidth) / columnWidth) + overscan
  );

  // Generate virtual items
  const virtualItems = useMemo(() => {
    const items: Array<{
      row: number;
      column: number;
      offsetTop: number;
      offsetLeft: number;
      width: number;
      height: number;
    }> = [];

    for (let row = startRow; row <= endRow; row++) {
      for (let col = startCol; col <= endCol; col++) {
        items.push({
          row,
          column: col,
          offsetTop: row * rowHeight,
          offsetLeft: col * columnWidth,
          width: columnWidth,
          height: rowHeight,
        });
      }
    }

    return items;
  }, [startRow, endRow, startCol, endCol, rowHeight, columnWidth]);

  // Handle scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
      setScrollLeft(container.scrollLeft);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  return {
    virtualItems,
    totalHeight,
    totalWidth,
    containerRef,
  };
}

/**
 * Infinite scroll hook with virtual list
 *
 * Combines virtual scrolling with infinite loading.
 *
 * @param config - Configuration
 * @returns Infinite virtual list state
 */
export function useInfiniteVirtualList<T>(config: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  threshold?: number;
}): VirtualListState & {
  isLoadingMore: boolean;
} {
  const {
    items,
    itemHeight,
    containerHeight,
    hasMore,
    loadMore,
    threshold = 0.8,
  } = config;

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const virtualList = useVirtualList({
    itemCount: items.length,
    itemHeight,
    containerHeight,
  });

  // Check if should load more
  useEffect(() => {
    const container = virtualList.containerRef.current;
    if (!container || !hasMore || isLoadingMore) return;

    const handleScroll = () => {
      const scrollPercentage =
        (container.scrollTop + container.clientHeight) / container.scrollHeight;

      if (scrollPercentage >= threshold) {
        setIsLoadingMore(true);
        void loadMore().finally(() => {
          setIsLoadingMore(false);
        });
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoadingMore, loadMore, threshold, virtualList.containerRef]);

  return {
    ...virtualList,
    isLoadingMore,
  };
}
