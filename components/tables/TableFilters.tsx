import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Plus, ChevronDown } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'range' | 'boolean';
  options?: FilterOption[];
}

interface ActiveFilter {
  key: string;
  operator: string;
  value: any;
}

interface TableFiltersProps {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFiltersChange: (filters: ActiveFilter[]) => void;
  className?: string;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  activeFilters,
  onFiltersChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddFilter, setShowAddFilter] = useState(false);

  const operators = {
    text: [
      { value: 'contains', label: 'Contains' },
      { value: 'equals', label: 'Equals' },
      { value: 'startsWith', label: 'Starts with' },
      { value: 'endsWith', label: 'Ends with' }
    ],
    select: [
      { value: 'equals', label: 'Is' },
      { value: 'notEquals', label: 'Is not' }
    ],
    date: [
      { value: 'equals', label: 'On' },
      { value: 'before', label: 'Before' },
      { value: 'after', label: 'After' },
      { value: 'between', label: 'Between' }
    ],
    range: [
      { value: 'equals', label: 'Equals' },
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'lessThan', label: 'Less than' },
      { value: 'between', label: 'Between' }
    ],
    boolean: [{ value: 'equals', label: 'Is' }]
  };

  const addFilter = (filterKey: string) => {
    const filter = filters.find((f) => f.key === filterKey);
    if (!filter) return;

    const newFilter: ActiveFilter = {
      key: filterKey,
      operator: operators[filter.type][0].value,
      value: ''
    };

    onFiltersChange([...activeFilters, newFilter]);
    setShowAddFilter(false);
  };

  const updateFilter = (index: number, updates: Partial<ActiveFilter>) => {
    const updated = [...activeFilters];
    updated[index] = { ...updated[index], ...updates };
    onFiltersChange(updated);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(activeFilters.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    onFiltersChange([]);
  };

  const getFilterConfig = (key: string) => {
    return filters.find((f) => f.key === key);
  };

  const availableFilters = filters.filter(
    (f) => !activeFilters.some((af) => af.key === f.key)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}
      role="region"
      aria-label="Table Filters"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-900 dark:text-white font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            aria-expanded={isExpanded}
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            {activeFilters.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                {activeFilters.length}
              </span>
            )}
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-4 h-4" />
            </motion.div>
          </button>

          {activeFilters.length > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 dark:text-red-400 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Active Filters */}
              {activeFilters.map((filter, index) => {
                const config = getFilterConfig(filter.key);
                if (!config) return null;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    {/* Field Name */}
                    <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm font-medium">
                      {config.label}
                    </div>

                    {/* Operator */}
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(index, { operator: e.target.value })}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {operators[config.type].map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>

                    {/* Value Input */}
                    {config.type === 'text' && (
                      <input
                        type="text"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        placeholder="Enter value..."
                        className="flex-1 min-w-[150px] px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    {config.type === 'select' && config.options && (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        className="flex-1 min-w-[150px] px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        {config.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {config.type === 'date' && (
                      <input
                        type="date"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        className="flex-1 min-w-[150px] px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    {config.type === 'range' && (
                      <input
                        type="number"
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        placeholder="Enter value..."
                        className="flex-1 min-w-[150px] px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    )}

                    {config.type === 'boolean' && (
                      <select
                        value={filter.value}
                        onChange={(e) => updateFilter(index, { value: e.target.value })}
                        className="flex-1 min-w-[150px] px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    )}

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFilter(index)}
                      className="p-1.5 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded"
                      aria-label="Remove filter"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}

              {/* Add Filter Button */}
              {availableFilters.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowAddFilter(!showAddFilter)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <Plus className="w-4 h-4" />
                    Add Filter
                  </button>

                  {/* Filter Dropdown */}
                  <AnimatePresence>
                    {showAddFilter && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10"
                      >
                        <div className="p-2 max-h-64 overflow-y-auto">
                          {availableFilters.map((filter) => (
                            <button
                              key={filter.key}
                              onClick={() => addFilter(filter.key)}
                              className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {activeFilters.length === 0 && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                  No filters applied. Click "Add Filter" to get started.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TableFilters;
