/**
 * @module components/enterprise/data/DataGridFilters
 * @category Enterprise
 * @description Advanced filtering component for DataGrid with support for multiple filter types.
 *
 * Supported filter types:
 * - Text (contains, exact match)
 * - Number (range, min, max)
 * - Date (range, before, after)
 * - Select (dropdown)
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import { type ColumnDefinition, type EditorOption } from './DataGridColumn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type FilterType = 'text' | 'number' | 'date' | 'select';

export interface FilterConfig {
  type: FilterType;
  value?: string | number;
  min?: number | string;
  max?: number | string;
  operator?: 'contains' | 'equals' | 'gt' | 'lt' | 'gte' | 'lte' | 'between';
}

export type FilterValue = string | number | FilterConfig;

export interface DataGridFiltersProps<T extends Record<string, unknown>> {
  columns: ColumnDefinition<T>[];
  filters: Record<string, FilterValue>;
  onFilterChange: (filters: Record<string, FilterValue>) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DataGridFilters<T extends Record<string, unknown>>({
  columns,
  filters,
  onFilterChange,
}: DataGridFiltersProps<T>) {
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(false);

  const filterableColumns = columns.filter(col => col.filterable !== false);

  const handleFilterChange = useCallback((columnId: string, value: FilterValue) => {
    const newFilters = { ...filters };

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      delete newFilters[columnId];
    } else {
      newFilters[columnId] = value;
    }

    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    onFilterChange({});
  }, [onFilterChange]);

  const activeFilterCount = Object.keys(filters).length;

  if (filterableColumns.length === 0) {
    return null;
  }

  return (
    <div className={cn("border-b", theme.border.default)}>
      {/* Filter Header */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-2 cursor-pointer",
          theme.surface.highlight,
          "hover:opacity-80 transition-opacity"
        )}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-medium", theme.text.primary)}>
            Filters
          </span>
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className={cn(
                "text-xs px-2 py-1 rounded",
                theme.surface.default,
                theme.text.secondary,
                "hover:opacity-80 transition-opacity"
              )}
            >
              Clear All
            </button>
          )}

          <span className={cn("text-sm", theme.text.secondary)}>
            {expanded ? '▲' : '▼'}
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      {expanded && (
        <div className={cn("p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", theme.surface.default)}>
          {filterableColumns.map((column) => (
            <FilterInput
              key={column.id}
              column={column}
              value={filters[column.id]}
              onChange={(value) => handleFilterChange(column.id, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

DataGridFilters.displayName = 'DataGridFilters';

// ============================================================================
// FILTER INPUT COMPONENT
// ============================================================================

interface FilterInputProps<T extends Record<string, unknown>> {
  column: ColumnDefinition<T>;
  value?: FilterValue;
  onChange: (value: FilterValue) => void;
}

function FilterInput<T extends Record<string, unknown>>({
  column,
  value,
  onChange,
}: FilterInputProps<T>) {
  // Determine filter type based on column configuration
  const getFilterType = (): FilterType => {
    if (column.editorType === 'select') return 'select';
    if (column.editorType === 'number') return 'number';
    if (column.editorType === 'date') return 'date';
    return 'text';
  };

  const filterType = getFilterType();

  // Render appropriate filter input based on type
  switch (filterType) {
    case 'text':
      return <TextFilter column={column} value={value} onChange={onChange} />;
    case 'number':
      return <NumberFilter column={column} value={value} onChange={onChange} />;
    case 'date':
      return <DateFilter column={column} value={value} onChange={onChange} />;
    case 'select':
      return <SelectFilter column={column} value={value} onChange={onChange} />;
    default:
      return <TextFilter column={column} value={value} onChange={onChange} />;
  }
}

// ============================================================================
// TEXT FILTER
// ============================================================================

function TextFilter<T extends Record<string, unknown>>({
  column,
  value,
  onChange,
}: FilterInputProps<T>) {
  const { theme } = useTheme();
  const textValue = typeof value === 'string' ? value : '';

  return (
    <div className="flex flex-col gap-1">
      <label className={cn("text-xs font-medium", theme.text.secondary)}>
        {column.header}
      </label>
      <input
        type="text"
        value={textValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Filter ${column.header.toLowerCase()}...`}
        className={cn(
          "px-3 py-2 text-sm rounded border",
          theme.surface.default,
          theme.border.default,
          theme.text.primary,
          "focus:outline-none focus:ring-2 focus:ring-blue-500"
        )}
      />
    </div>
  );
}

// ============================================================================
// NUMBER FILTER
// ============================================================================

function NumberFilter<T extends Record<string, unknown>>({
  column,
  value,
  onChange,
}: FilterInputProps<T>) {
  const { theme } = useTheme();

  const config = (typeof value === 'object' && 'type' in value ? value : {
    type: 'number',
    min: undefined,
    max: undefined,
  }) as FilterConfig;

  const handleMinChange = (min: string) => {
    onChange({
      type: 'number',
      min: min ? parseFloat(min) : undefined,
      max: config.max,
    });
  };

  const handleMaxChange = (max: string) => {
    onChange({
      type: 'number',
      min: config.min,
      max: max ? parseFloat(max) : undefined,
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <label className={cn("text-xs font-medium", theme.text.secondary)}>
        {column.header}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          value={config.min ?? ''}
          onChange={(e) => handleMinChange(e.target.value)}
          placeholder="Min"
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded border",
            theme.surface.default,
            theme.border.default,
            theme.text.primary,
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />
        <input
          type="number"
          value={config.max ?? ''}
          onChange={(e) => handleMaxChange(e.target.value)}
          placeholder="Max"
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded border",
            theme.surface.default,
            theme.border.default,
            theme.text.primary,
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />
      </div>
    </div>
  );
}

// ============================================================================
// DATE FILTER
// ============================================================================

function DateFilter<T extends Record<string, unknown>>({
  column,
  value,
  onChange,
}: FilterInputProps<T>) {
  const { theme } = useTheme();

  const config = (typeof value === 'object' && 'type' in value ? value : {
    type: 'date',
    min: undefined,
    max: undefined,
  }) as FilterConfig;

  const handleMinChange = (min: string) => {
    onChange({
      type: 'date',
      min: min || undefined,
      max: config.max,
    });
  };

  const handleMaxChange = (max: string) => {
    onChange({
      type: 'date',
      min: config.min,
      max: max || undefined,
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <label className={cn("text-xs font-medium", theme.text.secondary)}>
        {column.header}
      </label>
      <div className="flex flex-col gap-2">
        <input
          type="date"
          value={config.min ? String(config.min) : ''}
          onChange={(e) => handleMinChange(e.target.value)}
          className={cn(
            "px-3 py-2 text-sm rounded border",
            theme.surface.default,
            theme.border.default,
            theme.text.primary,
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />
        <input
          type="date"
          value={config.max ? String(config.max) : ''}
          onChange={(e) => handleMaxChange(e.target.value)}
          className={cn(
            "px-3 py-2 text-sm rounded border",
            theme.surface.default,
            theme.border.default,
            theme.text.primary,
            "focus:outline-none focus:ring-2 focus:ring-blue-500"
          )}
        />
      </div>
    </div>
  );
}

// ============================================================================
// SELECT FILTER
// ============================================================================

function SelectFilter<T extends Record<string, unknown>>({
  column,
  value,
  onChange,
}: FilterInputProps<T>) {
  const { theme } = useTheme();

  const config = (typeof value === 'object' && 'type' in value ? value : {
    type: 'select',
    value: undefined,
  }) as FilterConfig;

  const handleChange = (selectedValue: string) => {
    if (!selectedValue) {
      onChange('');
    } else {
      onChange({
        type: 'select',
        value: selectedValue,
      });
    }
  };

  const options = column.editorOptions || [];

  return (
    <div className="flex flex-col gap-1">
      <label className={cn("text-xs font-medium", theme.text.secondary)}>
        {column.header}
      </label>
      <select
        value={config.value ?? ''}
        onChange={(e) => handleChange(e.target.value)}
        className={cn(
          "px-3 py-2 text-sm rounded border",
          theme.surface.default,
          theme.border.default,
          theme.text.primary,
          "focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        )}
      >
        <option value="">All</option>
        {options.map((option: EditorOption) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
