import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string | number;
  render?: (value: any, row: T) => React.ReactNode;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  rowHeight?: number;
  overscan?: number;
  title?: string;
  className?: string;
}

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 48,
  overscan = 5,
  title,
  className = ''
}: VirtualizedTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    data.length - 1,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const visibleRows = data.slice(startIndex, endIndex + 1);
  const totalHeight = data.length * rowHeight;
  const offsetY = startIndex * rowHeight;

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="region"
      aria-label={title || 'Virtualized Table'}
    >
      {/* Header */}
      {title && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Showing {data.length.toLocaleString()} rows (virtualized)
          </p>
        </div>
      )}

      {/* Table Container */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: '600px' }}
        onScroll={handleScroll}
      >
        {/* Table */}
        <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
          {/* Header Row (Sticky) */}
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              {columns.map((column, index) => (
                <div
                  key={index}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex-shrink-0"
                  style={{ width: column.width || 'auto', minWidth: '100px' }}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visible Rows */}
          <div
            style={{
              transform: `translateY(${offsetY}px)`,
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0
            }}
          >
            {visibleRows.map((row, rowIndex) => {
              const actualIndex = startIndex + rowIndex;
              return (
                <div
                  key={actualIndex}
                  className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  style={{ height: `${rowHeight}px` }}
                  role="row"
                >
                  {columns.map((column, colIndex) => (
                    <div
                      key={colIndex}
                      className="px-6 py-3 text-sm text-gray-900 dark:text-white flex items-center flex-shrink-0 overflow-hidden"
                      style={{ width: column.width || 'auto', minWidth: '100px' }}
                      role="cell"
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T] || '')}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>
            Rows {startIndex + 1}-{endIndex + 1} of {data.length.toLocaleString()}
          </span>
          <span className="text-xs">
            Scroll position: {Math.round(scrollTop)}px
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default VirtualizedTable;
