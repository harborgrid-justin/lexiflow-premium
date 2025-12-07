
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

interface VirtualGridProps<T> {
  items: T[];
  itemHeight: number; // Height of the card
  itemWidth: number; // Width for column calculation
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  gap?: number;
  height: number | string;
}

export function VirtualGrid<T>({ 
  items, itemHeight, itemWidth, renderItem, className, emptyMessage = "No items found", gap = 16, height 
}: VirtualGridProps<T>) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    // Init
    setContainerSize({ 
        width: containerRef.current.clientWidth, 
        height: containerRef.current.clientHeight 
    });
    return () => observer.disconnect();
  }, []);

  // Calculate Columns
  const columnCount = Math.max(1, Math.floor((containerSize.width + gap) / (itemWidth + gap)));
  const totalRows = Math.ceil(items.length / columnCount);
  const totalHeight = totalRows * (itemHeight + gap) - gap;

  // Virtualization Math
  const overscan = 2; // Render 2 rows above/below viewport
  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan);
  const visibleRows = Math.ceil(containerSize.height / (itemHeight + gap)) + 2 * overscan;
  const endRow = Math.min(totalRows, startRow + visibleRows);

  const visibleItems = useMemo(() => {
    const rendered = [];
    for (let r = startRow; r < endRow; r++) {
      for (let c = 0; c < columnCount; c++) {
        const index = r * columnCount + c;
        if (index < items.length) {
          // Centering Logic
          const totalRowWidth = columnCount * itemWidth + (columnCount - 1) * gap;
          const offsetX = (containerSize.width - totalRowWidth) / 2;
          
          rendered.push({
            index,
            data: items[index],
            top: r * (itemHeight + gap),
            left: c * (itemWidth + gap) + Math.max(0, offsetX)
          });
        }
      }
    }
    return rendered;
  }, [items, startRow, endRow, columnCount, itemHeight, itemWidth, gap, containerSize.width, containerSize.height]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    // 60FPS sync
    requestAnimationFrame(() => setScrollTop(currentScrollTop));
  };

  if (items.length === 0) {
     return <div className={cn("flex items-center justify-center h-full text-slate-400", theme.text.tertiary)}>{emptyMessage}</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={cn("overflow-y-auto relative custom-scrollbar will-change-scroll h-full", className)}
      onScroll={handleScroll}
    >
      <div style={{ height: Math.max(totalHeight, containerSize.height), position: 'relative' }}>
        {visibleItems.map(({ index, data, top, left }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: itemWidth,
              height: itemHeight,
              transform: `translate3d(${left}px, ${top}px, 0)`,
              willChange: 'transform',
              contain: 'strict'
            }}
          >
            {renderItem(data, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
