'use client';

/**
 * AnalyticsFilters Component
 * Filter panel for analytics pages
 *
 * @component
 */

import { Button } from '@/components/ui/shadcn/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/shadcn/select';
import { cn } from '@/lib/utils';
import type { FilterConfig, FilterValues } from '@/types/analytics-module';
import { Filter, X } from 'lucide-react';
import * as React from 'react';

interface AnalyticsFiltersProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (id: string, value: string | string[]) => void;
  onReset: () => void;
  className?: string;
}

export function AnalyticsFilters({
  filters,
  values,
  onChange,
  onReset,
  className,
}: AnalyticsFiltersProps): React.JSX.Element {
  const hasActiveFilters = Object.keys(values).some((key) => {
    const value = values[key];
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  });

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700"
          >
            <X className="mr-1 h-3 w-3" />
            Clear all
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id}>
            <label
              htmlFor={filter.id}
              className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              {filter.label}
            </label>
            {filter.type === 'select' && filter.options && (
              <Select
                value={(values[filter.id] as string) || ''}
                onValueChange={(value) => onChange(filter.id, value)}
              >
                <SelectTrigger id={filter.id} className="w-full">
                  <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center justify-between gap-2">
                        {option.label}
                        {option.count !== undefined && (
                          <span className="text-xs text-slate-400">({option.count})</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {filter.type === 'multiselect' && filter.options && (
              <div className="flex flex-wrap gap-2">
                {filter.options.map((option) => {
                  const currentValues = (values[filter.id] as string[]) || [];
                  const isSelected = currentValues.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        const newValues = isSelected
                          ? currentValues.filter((v) => v !== option.value)
                          : [...currentValues, option.value];
                        onChange(filter.id, newValues);
                      }}
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                        isSelected
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400 dark:hover:bg-slate-600'
                      )}
                    >
                      {option.label}
                      {option.count !== undefined && (
                        <span className="ml-1 opacity-60">({option.count})</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

AnalyticsFilters.displayName = 'AnalyticsFilters';
