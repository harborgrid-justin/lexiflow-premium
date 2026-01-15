/**
 * CaseFilters Component
 *
 * Advanced filtering panel for case list with multiple filter criteria.
 * Supports status, type, court, date range, and custom filters.
 *
 * @module components/features/cases/CaseFilters
 */

import { cn } from '@/shared/lib/utils';
import { useState } from 'react';
import { getAllStatuses } from '../CaseStatusBadge';

export interface CaseFilterValues {
  status?: string[];
  matterType?: string[];
  practiceArea?: string[];
  court?: string[];
  jurisdiction?: string[];
  leadAttorney?: string[];
  client?: string[];
  dateRange?: {
    start?: string;
    end?: string;
  };
  budgetRange?: {
    min?: number;
    max?: number;
  };
  hasTrialDate?: boolean;
  isArchived?: boolean;
  searchQuery?: string;
}

export interface CaseFiltersProps {
  /** Current filter values */
  filters: CaseFilterValues;
  /** Callback when filters change */
  onFiltersChange: (filters: CaseFilterValues) => void;
  /** Available filter options */
  options?: {
    matterTypes?: string[];
    practiceAreas?: string[];
    courts?: string[];
    jurisdictions?: string[];
    attorneys?: string[];
    clients?: string[];
  };
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * CaseFilters component provides advanced filtering for cases
 */
export function CaseFilters({
  filters,
  onFiltersChange,
  options = {},
  className,
}: CaseFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statuses = getAllStatuses();

  const handleFilterChange = (key: keyof CaseFilterValues, value: unknown) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handleArrayFilterToggle = (key: keyof CaseFilterValues, value: string) => {
    const currentValues = (filters[key] as string[]) || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    handleFilterChange(key, newValues.length > 0 ? newValues : undefined);
  };

  const handleClearAll = () => {
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key as keyof CaseFilterValues] !== undefined
  ).length;

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800', className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ backgroundColor: 'transparent' }}
            className="rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg
              className={cn('h-5 w-5 transition-transform', isExpanded && 'rotate-180')}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="space-y-6 p-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Search
            </label>
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value || undefined)}
              placeholder="Search cases..."
              className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleArrayFilterToggle('status', status)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    filters.status?.includes(status)
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Matter Type Filter */}
          {options.matterTypes && options.matterTypes.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Matter Type
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {options.matterTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleArrayFilterToggle('matterType', type)}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      filters.matterType?.includes(type)
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Court Filter */}
          {options.courts && options.courts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Court
              </label>
              <select
                multiple
                value={filters.court || []}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                  handleFilterChange('court', selected.length > 0 ? selected : undefined);
                }}
                className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                size={Math.min(options.courts.length, 5)}
              >
                {options.courts.map((court) => (
                  <option key={court} value={court}>
                    {court}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Filing Date Range
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">From</label>
                <input
                  type="date"
                  value={filters.dateRange?.start || ''}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      start: e.target.value || undefined,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">To</label>
                <input
                  type="date"
                  value={filters.dateRange?.end || ''}
                  onChange={(e) =>
                    handleFilterChange('dateRange', {
                      ...filters.dateRange,
                      end: e.target.value || undefined,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Budget Range
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">Min</label>
                <input
                  type="number"
                  placeholder="$0"
                  value={filters.budgetRange?.min || ''}
                  onChange={(e) =>
                    handleFilterChange('budgetRange', {
                      ...filters.budgetRange,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400">Max</label>
                <input
                  type="number"
                  placeholder="$∞"
                  value={filters.budgetRange?.max || ''}
                  onChange={(e) =>
                    handleFilterChange('budgetRange', {
                      ...filters.budgetRange,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.hasTrialDate || false}
                onChange={(e) => handleFilterChange('hasTrialDate', e.target.checked || undefined)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Has trial date</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.isArchived || false}
                onChange={(e) => handleFilterChange('isArchived', e.target.checked || undefined)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show archived cases</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
