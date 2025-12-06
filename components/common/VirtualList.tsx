
import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/cn';

interface VirtualListProps<T> {
  items: T[];
  height: number | string; // Container height
  itemHeight: number; // Fixed height per row
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  emptyMessage?: string;
  footer?: React.ReactNode; 
}

export function VirtualList<T>({ items, height, itemHeight, renderItem, className, emptyMessage = "No items found", footer }: VirtualListProps<T>) {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  // Resize Observer to handle responsive container height dynamically
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    observer.observe(containerRef.current);
    // Initial set
    setContainerHeight(containerRef.current.clientHeight);

    return () => observer.disconnect();
  }, []);

  const totalItemsHeight = items.length * itemHeight;
  
  const overscan = 5; 
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const safeHeight = containerHeight || 600; 
  const visibleNodeCount = Math.ceil(safeHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(items.length, startIndex + visibleNodeCount);

  const visibleItems = useMemo(() => {
    const visible = [];
    for (let i = startIndex; i < endIndex; i++) {
      visible.push({
        index: i,
        data: items[i],
        top: i * itemHeight
      });
    }
    return visible;
  }, [items, startIndex, endIndex, itemHeight]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const currentScrollTop = e.currentTarget.scrollTop;
    requestAnimationFrame(() => {
        setScrollTop(currentScrollTop);
    });
  };

  if (items.length === 0 && !footer) {
    return (
      <div 
        className={cn("flex items-center justify-center text-sm h-full", className, theme.text.tertiary)} 
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn("overflow-y-auto relative custom-scrollbar will-change-scroll", className)}
      style={{ height: typeof height === 'number' ? `${height}px` : '100%', contain: 'strict' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalItemsHeight + (footer ? 60 : 0), position: 'relative' }}>
        {visibleItems.map(({ index, data, top }) => (
          <div 
            key={index} 
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
}