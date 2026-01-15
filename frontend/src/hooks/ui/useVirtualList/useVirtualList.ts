/**
 * useVirtualList Hook
 * @module hooks/useVirtualList
 * @description Enterprise-grade virtual list implementation for rendering large datasets
 * @status PRODUCTION READY
 */

import { useCallback, useMemo, useState } from "react";

export interface VirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export const useVirtualList = <T>(items: T[], options: VirtualListOptions) => {
  const { itemHeight, containerHeight, overscan = 3 } = options;
  // State only stores the render range, not the exact pixel scroll
  const [renderRange, setRenderRange] = useState({ start: 0, end: 10 });

  // Calculations that don't depend on exact scroll state, but on items/config
  const totalHeight = items.length * itemHeight;

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = e.currentTarget.scrollTop;

      // Calculate indices based on scroll position
      const newStart = Math.max(
        0,
        Math.floor(scrollTop / itemHeight) - overscan
      );
      const visibleItemCount =
        Math.ceil(containerHeight / itemHeight) + 2 * overscan;
      const newEnd = Math.min(items.length, newStart + visibleItemCount);

      // OPTIMIZATION: Only trigger re-render if the set of visible items changes
      // This implements "Scroll Performance Isolation" effectively
      setRenderRange((prev) => {
        if (prev.start === newStart && prev.end === newEnd) {
          return prev;
        }
        return { start: newStart, end: newEnd };
      });
    },
    [itemHeight, containerHeight, overscan, items.length]
  );

  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = renderRange.start; i < renderRange.end; i++) {
      // Validation: Ensure we don't access out of bounds
      if (!items[i]) continue;

      result.push({
        index: i,
        data: items[i],
        style: {
          position: "absolute" as const,
          top: i * itemHeight,
          height: itemHeight,
          width: "100%",
          left: 0,
          // VISUAL STABILITY: Use transform for better composite performance?
          // Actually absolute top is fine for lists, but transform: translate3d is hardware accelerated
          // transform: `translate3d(0, ${i * itemHeight}px, 0)`
        },
      });
    }
    return result;
  }, [renderRange.start, renderRange.end, items, itemHeight]);

  return {
    virtualItems,
    totalHeight,
    onScroll,
    // scrollTop is no longer exposed as state since we decouple it
    // If needed, consumer can use e.currentTarget.scrollTop
  };
};
