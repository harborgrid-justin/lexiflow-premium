/**
 * @module components/common/VirtualList
 * @category Common
 * @description Virtualized list with fixed-height rows and scroll optimization.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { forwardRef, useDeferredValue, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
interface VirtualListProps<T> {
  items: T[];
  height: number | string; // Container height
  itemHeight: number; // Fixed height per row
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  footer?: React.ReactNode;
  getItemKey?: (item: T) => string | number;
}

export interface VirtualListRef {
  scrollToIndex: (index: number) => void;
}

// We use a generic component definition here compatible with forwardRef
const VirtualListComponent = <T = Record<string, unknown>>(
  { items, height, itemHeight, renderItem, className, emptyMessage = "No items found", footer, getItemKey }: VirtualListProps<T>,
  ref: React.Ref<VirtualListRef>
) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const deferredItems = useDeferredValue(items);

  // Expose scroll method via ref
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    }
  }), [itemHeight]);

  // Resize Observer to handle responsive container height dynamically
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to debounce and prevent ResizeObserver loop error
      requestAnimationFrame(() => {
        for (const entry of entries) {
          if (entry.contentRect) {
            const newHeight = entry.contentRect.height;
            if (newHeight > 0) {
              setContainerHeight(newHeight);
            }
          }
        }
      });
    });

    observer.observe(containerRef.current);
    // Initial set - use setTimeout to ensure layout has completed
    setTimeout(() => {
      if (containerRef.current) {
        const initialHeight = containerRef.current.clientHeight;
        if (initialHeight > 0) {
          setContainerHeight(initialHeight);
        }
      }
    }, 0);

    return () => observer.disconnect();
  }, []);

  const safeItems = useMemo(() => deferredItems || [], [deferredItems]);
  const totalItemsHeight = safeItems.length * itemHeight;

  // Safety check for invalid height calculations
  if (!itemHeight || itemHeight <= 0 || !Number.isFinite(itemHeight)) {
    console.error('[VirtualList] Invalid itemHeight:', itemHeight);
    return (
      <div
        ref={containerRef}
        className={cn("flex items-center justify-center text-sm h-full overflow-hidden", className, theme.text.tertiary)}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        Error: Invalid item height
      </div>
    );
  }

  const overscan = 5;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  // Use measured height if available, otherwise use a large default to render all items initially
  const safeHeight = containerHeight > 0 ? containerHeight : 2000;
  const visibleNodeCount = Math.ceil(safeHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(safeItems.length, startIndex + visibleNodeCount);

  const visibleItems = useMemo(() => {
    const visible = [];
    for (let i = startIndex; i < endIndex; i++) {
      visible.push({
        index: i,
        data: safeItems[i],
        top: i * itemHeight
      });
    }
    return visible;
  }, [safeItems, startIndex, endIndex, itemHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
      setScrollTop(currentScrollTop);
    });
  };

  const resolveKey = (item: T, index: number): string | number => {
    if (getItemKey) return getItemKey(item);
    if (item && typeof item === 'object' && 'id' in item) {
      const id = (item as Record<string, unknown>).id;
      if (typeof id === 'string' || typeof id === 'number') return id;
    }
    return index;
  };

  if (safeItems.length === 0 && !footer) {
    return (
      <div
        ref={containerRef} // Ensure ref is attached even in empty state for measurements/consistency
        className={cn("flex items-center justify-center text-sm h-full overflow-hidden", className, theme.text.tertiary)}
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn("overflow-y-auto relative custom-scrollbar will-change-scroll scroll-smooth", className)}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        minHeight: typeof height === 'string' ? '400px' : undefined,
        contain: 'strict'
      }}
      onScroll={handleScroll}
    >
      <div style={{ height: Number.isFinite(totalItemsHeight) ? totalItemsHeight + (footer ? 60 : 0) : 0, position: 'relative' }}>
        {visibleItems.map(({ index, data, top }) => (
          <div
            key={resolveKey(data, index)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: itemHeight,
              transform: `translate3d(0, ${top}px, 0)`,
              willChange: 'transform',
              contentVisibility: 'auto',
              containIntrinsicSize: `0px ${itemHeight}px`
            }}
          >
            {renderItem(data, index)}
          </div>
        ))}

        {footer && (
          <div
            style={{
              position: 'absolute',
              top: totalItemsHeight,
              left: 0,
              width: '100%',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const VirtualList = forwardRef(VirtualListComponent) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<VirtualListRef> }
) => React.ReactElement;
