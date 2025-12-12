import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ArrowUpDown,
} from 'lucide-react';

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  sortFn?: (a: any, b: any, direction: 'asc' | 'desc') => number;
}

export interface SortableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  defaultSort?: SortConfig;
  multiSort?: boolean;
  onSort?: (sortConfig: SortConfig | SortConfig[]) => void;
  className?: string;
}

export function SortableTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  defaultSort,
  multiSort = false,
  onSort,
  className = '',
}: SortableTableProps<T>) {
  const [sortConfigs, setSortConfigs] = useState<SortConfig[]>(
    defaultSort ? [defaultSort] : []
  );

  const sortedData = useMemo(() => {
    if (sortConfigs.length === 0) return data;

    return [...data].sort((a, b) => {
      for (const config of sortConfigs) {
        const column = columns.find((col) => col.key === config.key);
        const aValue = a[config.key];
        const bValue = b[config.key];

        let comparison = 0;

        if (column?.sortFn) {
          comparison = column.sortFn(aValue, bValue, config.direction);
        } else {
          // Default sorting logic
          if (aValue === null || aValue === undefined) comparison = 1;
          else if (bValue === null || bValue === undefined) comparison = -1;
          else if (typeof aValue === 'number' && typeof bValue === 'number') {
            comparison = aValue - bValue;
          } else if (aValue instanceof Date && bValue instanceof Date) {
            comparison = aValue.getTime() - bValue.getTime();
          } else {
            comparison = String(aValue).localeCompare(String(bValue));
          }
        }

        if (comparison !== 0) {
          return config.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
  }, [data, sortConfigs, columns]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (column?.sortable === false) return;

    let newSortConfigs: SortConfig[];

    if (multiSort) {
      const existingIndex = sortConfigs.findIndex((s) => s.key === columnKey);

      if (existingIndex >= 0) {
        const existing = sortConfigs[existingIndex];
        if (existing.direction === 'asc') {
          newSortConfigs = [
            ...sortConfigs.slice(0, existingIndex),
            { key: columnKey, direction: 'desc' },
            ...sortConfigs.slice(existingIndex + 1),
          ];
        } else {
          newSortConfigs = sortConfigs.filter((s) => s.key !== columnKey);
        }
      } else {
        newSortConfigs = [...sortConfigs, { key: columnKey, direction: 'asc' }];
      }
    } else {
      const existing = sortConfigs.find((s) => s.key === columnKey);
      if (existing && existing.direction === 'asc') {
        newSortConfigs = [{ key: columnKey, direction: 'desc' }];
      } else if (existing && existing.direction === 'desc') {
        newSortConfigs = [];
      } else {
        newSortConfigs = [{ key: columnKey, direction: 'asc' }];
      }
    }

    setSortConfigs(newSortConfigs);
    onSort?.(multiSort ? newSortConfigs : newSortConfigs[0]);
  };

  const getSortIcon = (columnKey: string) => {
    const sortConfig = sortConfigs.find((s) => s.key === columnKey);
    const sortIndex = sortConfigs.findIndex((s) => s.key === columnKey);

    if (!sortConfig) {
      return (
        <ChevronsUpDown className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }

    return (
      <div className="flex items-center gap-1">
        {sortConfig.direction === 'asc' ? (
          <ChevronUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        )}
        {multiSort && sortConfigs.length > 1 && (
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
            {sortIndex + 1}
          </span>
        )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="region"
      aria-label={title || 'Sortable Table'}
    >
      {/* Header */}
      {title && (
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            {sortConfigs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <ArrowUpDown className="w-4 h-4" />
                <span>
                  Sorted by {sortConfigs.length} column{sortConfigs.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    setSortConfigs([]);
                    onSort?.(multiSort ? [] : undefined as any);
                  }}
                  className="text-blue-600 dark:text-blue-400 hover:underline ml-2"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          {multiSort && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
              Hold Shift to sort by multiple columns
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.sortable !== false ? (
                    <button
                      onClick={(e) => {
                        if (multiSort && e.shiftKey) {
                          handleSort(column.key as string);
                        } else {
                          handleSort(column.key as string);
                        }
                      }}
                      className="group flex items-center gap-2 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:underline transition-colors w-full"
                      aria-label={`Sort by ${column.header}`}
                    >
                      <span>{column.header}</span>
                      {getSortIcon(column.key as string)}
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence mode="popLayout">
              {sortedData.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap"
                    >
                      {column.render
                        ? column.render(row[column.key as keyof T], row)
                        : String(row[column.key as keyof T] || '')}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>

        {sortedData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No data available</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {sortedData.length} of {data.length} rows
        </p>
      </div>
    </motion.div>
  );
}

export default SortableTable;
