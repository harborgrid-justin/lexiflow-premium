/**
 * @module components/common/VirtualGrid
 * @category Common
 * @description Virtualized grid with responsive columns and scroll optimization.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';

// Utils & Constants
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number; // Height of the card
  itemWidth: number; // Width for column calculation
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  gap?: number;
  height: number | string;
  getItemKey?: (item: T) => string | number;
}

/**
 * VirtualGrid - React 18 optimized with React.memo
 */
export const VirtualGrid = React.memo(<T = Record<string, unknown>>(props: VirtualGridProps<T>) => {
  const {
    items, itemHeight, itemWidth, renderItem, className, emptyMessage = "No items found", gap = 16, height, getItemKey
  } = props;
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const rafRef = useRef<number | null>(null);
  const deferredItems = useDeferredValue(items);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      // Debounce resize updates with RAF to prevent thrashing
      if (rafRef.current) cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        for (const entry of entries) {
          setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
        }
      });
    });

    observer.observe(containerRef.current);
    // Init
    setContainerSize({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight
    });

    return () => {
      observer.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Calculate Columns
  const safeItemWidth = itemWidth || 250;
  const safeItemHeight = itemHeight || 180;
  const safeGap = gap || 16;
  const safeWidth = containerSize.width || 0;
  const safeHeight = containerSize.height || 0;

  const columnCount = Math.max(1, Math.floor((safeWidth + safeGap) / (safeItemWidth + safeGap)));
  const totalRows = Math.ceil((deferredItems?.length || 0) / columnCount);
  const totalHeight = Math.max(0, totalRows * (safeItemHeight + safeGap) - safeGap);
  const containerContentHeight = Math.max(totalHeight, safeHeight);
  const safeContainerContentHeight = isNaN(containerContentHeight) ? 0 : containerContentHeight;

  // Virtualization Math
  const overscan = 2; // Render 2 rows above/below viewport
  const startRow = Math.max(0, Math.floor(scrollTop / (safeItemHeight + safeGap)) - overscan);
  const visibleRows = safeHeight > 0
    ? Math.ceil(safeHeight / (safeItemHeight + safeGap)) + 2 * overscan
    : 5; // Default to 5 rows if container not yet measured
  const endRow = Math.min(totalRows, startRow + visibleRows);

  const visibleItems = useMemo(() => {
    const rendered = [];
    for (let r = startRow; r < endRow; r++) {
      for (let c = 0; c < columnCount; c++) {
        const index = r * columnCount + c;
        if (index < deferredItems.length) {
          // Centering Logic
          const totalRowWidth = columnCount * safeItemWidth + (columnCount - 1) * safeGap;
          const offsetX = (safeWidth - totalRowWidth) / 2;

          rendered.push({
            index,
            data: deferredItems[index],
            top: r * (safeItemHeight + safeGap),
            left: c * (safeItemWidth + safeGap) + Math.max(0, offsetX)
          });
        }
      }
    }
    return rendered;
  }, [deferredItems, startRow, endRow, columnCount, safeItemHeight, safeItemWidth, safeGap, safeWidth]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    // 60FPS sync
    requestAnimationFrame(() => setScrollTop(currentScrollTop));
  };

  const resolveKey = (item: T, index: number): string | number => {
    if (getItemKey) return getItemKey(item);
    if (item && typeof item === 'object' && 'id' in item) {
      const id = (item as Record<string, unknown>).id;
      if (typeof id === 'string' || typeof id === 'number') return id;
    }
    return index;
  };

  if (deferredItems.length === 0) {
    return <div className={cn("flex items-center justify-center h-full text-slate-400", theme.text.tertiary)}>{emptyMessage}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto relative custom-scrollbar will-change-scroll h-full", className)}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
      onScroll={handleScroll}
    >
      <div style={{ height: safeContainerContentHeight, position: 'relative' }}>
        {visibleItems.map(({ index, data, top, left }) => {
          if (!data) return null;
          return (
            <div
              key={resolveKey(data, index)}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: safeItemWidth,
                height: safeItemHeight,
                transform: `translate3d(${left}px, ${top}px, 0)`,
                willChange: 'transform',
                contain: 'strict'
              }}
            >
              {renderItem(data, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
});
