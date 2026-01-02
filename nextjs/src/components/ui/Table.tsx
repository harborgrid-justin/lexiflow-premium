'use client';

/**
 * Table Component - Enterprise data table
 * Supports sorting, filtering, and pagination
 */

import { ChevronDown, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

interface TableColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => ReactNode);
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends { id: string | number }>({
  columns,
  data,
  sortBy,
  sortOrder = 'asc',
  onSort,
  isLoading,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            {columns.map((column, idx) => (
              <th
                key={idx}
                className={`px-6 py-3 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 ${column.width || ''}`}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && onSort && (
                    <button
                      onClick={() => {
                        const newOrder =
                          sortBy === column.header && sortOrder === 'asc'
                            ? 'desc'
                            : 'asc';
                        onSort(column.header, newOrder);
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
                    >
                      {sortBy === column.header ? (
                        sortOrder === 'asc' ? (
                          <ChevronUp className="h-4 w-4 text-blue-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-blue-600" />
                        )
                      ) : (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center">
                <div className="inline-block">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={row.id}
                className={`border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${rowIdx % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50/50 dark:bg-slate-900/50'
                  }`}
              >
                {columns.map((column, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 text-sm text-slate-900 dark:text-slate-50 ${column.width || ''}`}>
                    {typeof column.accessor === 'function'
                      ? column.accessor(row)
                      : (row[column.accessor] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
