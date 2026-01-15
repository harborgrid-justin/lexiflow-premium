/**
 * FilterPanel Component
 * Advanced filtering panel for analytics dashboards
 */

import { ChevronDown, Filter, X } from 'lucide-react';
import { useState } from 'react';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  type: 'select' | 'multiselect' | 'search' | 'range';
  options?: FilterOption[];
  value?: string | string[] | { min: number; max: number };
}

export interface FilterPanelProps {
  filters: FilterGroup[];
  values: Record<string, unknown>;
  onChange: (filterId: string, value: unknown) => void;
  onReset?: () => void;
  className?: string;
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onReset,
  className = '',
}: FilterPanelProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(filters.map((f) => f.id))
  );

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const getActiveFilterCount = () => {
    return Object.values(values).filter((v) => {
      if (Array.isArray(v)) return v.length > 0;
      if (typeof v === 'object' && v !== null) return true;
      return v !== null && v !== undefined && v !== '';
    }).length;
  };

  const renderFilter = (filter: FilterGroup) => {
    const isExpanded = expandedGroups.has(filter.id);

    return (
      <div key={filter.id} className="border-b border-gray-200 last:border-0 dark:border-gray-700">
        <button
          onClick={() => toggleGroup(filter.id)}
          style={{ backgroundColor: 'transparent' }}
          className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {filter.label}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''
              }`}
          />
        </button>

        {isExpanded && (
          <div className="px-4 pb-4">
            {filter.type === 'select' && (
              <select
                value={values[filter.id] as string || ''}
                onChange={(e) => onChange(filter.id, e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="">All</option>
                {filter.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                    {option.count !== undefined && ` (${option.count})`}
                  </option>
                ))}
              </select>
            )}

            {filter.type === 'multiselect' && (
              <div className="space-y-2">
                {filter.options?.map((option) => {
                  const selectedValues = (values[filter.id] as string[]) || [];
                  const isChecked = selectedValues.includes(option.value);

                  return (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const newValues = e.target.checked
                            ? [...selectedValues, option.value]
                            : selectedValues.filter((v) => v !== option.value);
                          onChange(filter.id, newValues);
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-gray-700 dark:text-gray-300">
                        {option.label}
                        {option.count !== undefined && (
                          <span className="ml-1 text-gray-500">({option.count})</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {filter.type === 'search' && (
              <input
                type="text"
                value={values[filter.id] as string || ''}
                onChange={(e) => onChange(filter.id, e.target.value)}
                placeholder={`Search ${filter.label.toLowerCase()}...`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              />
            )}

            {filter.type === 'range' && (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={(values[filter.id] as { min: number; max: number })?.min || ''}
                  onChange={(e) => {
                    const currentValue = (values[filter.id] as { min: number; max: number }) || { min: 0, max: 0 };
                    onChange(filter.id, { ...currentValue, min: Number(e.target.value) });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={(values[filter.id] as { min: number; max: number })?.max || ''}
                  onChange={(e) => {
                    const currentValue = (values[filter.id] as { min: number; max: number }) || { min: 0, max: 0 };
                    onChange(filter.id, { ...currentValue, max: Number(e.target.value) });
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Filters
          </h3>
          {getActiveFilterCount() > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        {onReset && getActiveFilterCount() > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {filters.map(renderFilter)}
      </div>
    </div>
  );
}
