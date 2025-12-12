import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string | number | boolean;
}

export interface ColumnFilter<T> {
  key: keyof T | string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date';
  options?: FilterOption[];
  placeholder?: string;
}

export interface Column<T> {
  key: keyof T | string;
  header: string;
  filterable?: boolean;
  filter?: ColumnFilter<T>;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface FilterableTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  globalSearch?: boolean;
  onFilterChange?: (filters: Record<string, any>) => void;
  className?: string;
}

export function FilterableTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  globalSearch = true,
  onFilterChange,
  className = '',
}: FilterableTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const filteredData = useMemo(() => {
    let result = [...data];

    // Global search
    if (searchTerm && globalSearch) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Column filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) {
        return;
      }

      const column = columns.find((col) => col.key === key);
      if (!column?.filter) return;

      result = result.filter((row) => {
        const cellValue = row[key];

        switch (column.filter!.type) {
          case 'text':
            return String(cellValue)
              .toLowerCase()
              .includes(String(filterValue).toLowerCase());

          case 'select':
            return String(cellValue) === String(filterValue);

          case 'multiselect':
            return Array.isArray(filterValue) && filterValue.includes(String(cellValue));

          case 'range':
            if (filterValue.min !== undefined && cellValue < filterValue.min) return false;
            if (filterValue.max !== undefined && cellValue > filterValue.max) return false;
            return true;

          case 'date':
            const date = new Date(cellValue);
            if (filterValue.start && date < new Date(filterValue.start)) return false;
            if (filterValue.end && date > new Date(filterValue.end)) return false;
            return true;

          default:
            return true;
        }
      });
    });

    return result;
  }, [data, searchTerm, columnFilters, columns, globalSearch]);

  const updateColumnFilter = (key: string, value: any) => {
    const newFilters = { ...columnFilters, [key]: value };
    setColumnFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...columnFilters };
    delete newFilters[key];
    setColumnFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const clearAllFilters = () => {
    setColumnFilters({});
    setSearchTerm('');
    onFilterChange?.({});
  };

  const activeFilterCount = Object.keys(columnFilters).length + (searchTerm ? 1 : 0);

  const renderFilterInput = (column: Column<T>) => {
    if (!column.filter) return null;

    const filterValue = columnFilters[column.key as string];

    switch (column.filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={filterValue || ''}
            onChange={(e) => updateColumnFilter(column.key as string, e.target.value)}
            placeholder={column.filter.placeholder || `Filter ${column.header}...`}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={filterValue || ''}
            onChange={(e) => updateColumnFilter(column.key as string, e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All</option>
            {column.filter.options?.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case 'multiselect':
        return (
          <div className="space-y-2">
            {column.filter.options?.map((opt) => (
              <label
                key={String(opt.value)}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={(filterValue || []).includes(String(opt.value))}
                  onChange={(e) => {
                    const current = filterValue || [];
                    const newValue = e.target.checked
                      ? [...current, String(opt.value)]
                      : current.filter((v: string) => v !== String(opt.value));
                    updateColumnFilter(column.key as string, newValue);
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case 'range':
        return (
          <div className="flex gap-2">
            <input
              type="number"
              value={filterValue?.min || ''}
              onChange={(e) =>
                updateColumnFilter(column.key as string, {
                  ...filterValue,
                  min: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Min"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="number"
              value={filterValue?.max || ''}
              onChange={(e) =>
                updateColumnFilter(column.key as string, {
                  ...filterValue,
                  max: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Max"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'date':
        return (
          <div className="space-y-2">
            <input
              type="date"
              value={filterValue?.start || ''}
              onChange={(e) =>
                updateColumnFilter(column.key as string, {
                  ...filterValue,
                  start: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={filterValue?.end || ''}
              onChange={(e) =>
                updateColumnFilter(column.key as string, {
                  ...filterValue,
                  end: e.target.value,
                })
              }
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const filterableColumns = columns.filter((col) => col.filterable !== false && col.filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
      role="region"
      aria-label={title || 'Filterable Table'}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}

          <div className="flex items-center gap-3">
            {globalSearch && (
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search all columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {filterableColumns.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters || activeFilterCount > 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
            {searchTerm && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
              >
                <span>Search: "{searchTerm}"</span>
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            )}
            {Object.entries(columnFilters).map(([key, value]) => {
              const column = columns.find((col) => col.key === key);
              return (
                <motion.div
                  key={key}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm"
                >
                  <span>{column?.header}</span>
                  <button
                    onClick={() => clearFilter(key)}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {filterableColumns.map((column) => (
                  <div key={column.key as string} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {column.header}
                    </label>
                    {renderFilterInput(column)}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full" role="table">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider ${
                    column.width || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence mode="popLayout">
              {filteredData.map((row, rowIndex) => (
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
                      className="px-6 py-4 text-sm text-gray-900 dark:text-white"
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

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {activeFilterCount > 0 ? 'No results match your filters' : 'No data available'}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredData.length} of {data.length} rows
        </p>
      </div>
    </motion.div>
  );
}

export default FilterableTable;
