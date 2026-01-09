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
  const [scrollTop, setScrollTop] = useState(0);

  // Calculations
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const visibleItemCount =
    Math.ceil(containerHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(items.length, startIndex + visibleItemCount);

  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = startIndex; i < endIndex; i++) {
      result.push({
        index: i,
        data: items[i],
        style: {
          position: "absolute" as const,
          top: i * itemHeight,
          height: itemHeight,
          width: "100%",
          left: 0,
        },
      });
    }
    return result;
  }, [items, startIndex, endIndex, itemHeight]);

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    virtualItems,
    totalHeight,
    onScroll,
    scrollTop,
  };
};
