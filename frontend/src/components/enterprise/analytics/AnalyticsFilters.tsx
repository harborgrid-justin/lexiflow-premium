/**
 * @module components/enterprise/analytics/AnalyticsFilters
 * @category Enterprise Analytics
 * @description Interactive filters for analytics dashboards.
 *
 * Features:
 * - Date range selection
 * - Multi-select filters
 * - Quick date presets
 * - Filter state management
 * - Reset functionality
 * - Responsive design
 * - Theme-aware styling
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useCallback, useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DatePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'lastQuarter' | 'lastYear' | 'ytd' | 'custom';

export interface DateRange {
  /** Start date */
  startDate: string;
  /** End date */
  endDate: string;
}

export interface FilterOption {
  /** Option value */
  value: string;
  /** Display label */
  label: string;
  /** Whether option is selected */
  selected?: boolean;
}

export interface FilterGroup {
  /** Group identifier */
  id: string;
  /** Group label */
  label: string;
  /** Available options */
  options: FilterOption[];
  /** Allow multiple selections */
  multiSelect?: boolean;
}

export interface AnalyticsFilterState {
  /** Date range */
  dateRange: DateRange;
  /** Selected date preset */
  datePreset: DatePreset;
  /** Selected filter values by group ID */
  filters: Record<string, string[]>;
}

export interface AnalyticsFiltersProps {
  /** Initial filter state */
  initialState?: Partial<AnalyticsFilterState>;
  /** Filter groups configuration */
  filterGroups?: FilterGroup[];
  /** Whether to show date range selector */
  showDateRange?: boolean;
  /** Whether to show quick date presets */
  showPresets?: boolean;
  /** Available date presets */
  presets?: DatePreset[];
  /** Callback when filters change */
  onFilterChange?: (state: AnalyticsFilterState) => void;
  /** Custom className */
  className?: string;
  /** Whether filters are in loading state */
  loading?: boolean;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getDateRangeForPreset = (preset: DatePreset): DateRange => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return {
        startDate: today.toISOString().split('T')[0] || '',
        endDate: today.toISOString().split('T')[0] || ''
      };
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return {
        startDate: yesterday.toISOString().split('T')[0] || '',
        endDate: yesterday.toISOString().split('T')[0] || ''
      };
    }
    case 'last7days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return {
        startDate: start.toISOString().split('T')[0] || '',
        endDate: today.toISOString().split('T')[0] || ''
      };
    }
    case 'last30days': {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return {
        startDate: start.toISOString().split('T')[0] || '',
        endDate: today.toISOString().split('T')[0] || ''
      };
    }
    case 'lastQuarter': {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const lastQuarter = currentQuarter === 0 ? 3 : currentQuarter - 1;
      const year = currentQuarter === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const start = new Date(year, lastQuarter * 3, 1);
      const end = new Date(year, (lastQuarter + 1) * 3, 0);
      return {
        startDate: start.toISOString().split('T')[0] || '',
        endDate: end.toISOString().split('T')[0] || ''
      };
    }
    case 'lastYear': {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return {
        startDate: start.toISOString().split('T')[0] || '',
        endDate: end.toISOString().split('T')[0] || ''
      };
    }
    case 'ytd': {
      const start = new Date(now.getFullYear(), 0, 1);
      return {
        startDate: start.toISOString().split('T')[0] || '',
        endDate: today.toISOString().split('T')[0] || ''
      };
    }
    default:
      return {
        startDate: today.toISOString().split('T')[0] || '',
        endDate: today.toISOString().split('T')[0] || ''
      };
  }
};

const presetLabels: Record<DatePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last7days: 'Last 7 Days',
  last30days: 'Last 30 Days',
  lastQuarter: 'Last Quarter',
  lastYear: 'Last Year',
  ytd: 'Year to Date',
  custom: 'Custom Range'
};

// ============================================================================
// COMPONENT
// ============================================================================

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  initialState,
  filterGroups = [],
  showDateRange = true,
  showPresets = true,
  presets = ['today', 'last7days', 'last30days', 'lastQuarter', 'ytd', 'custom'],
  onFilterChange,
  className = '',
  loading = false
}) => {
  const { theme } = useTheme();

  // Initialize state
  const [filterState, setFilterState] = useState<AnalyticsFilterState>(() => {
    const defaultPreset: DatePreset = 'last30days';
    const defaultDateRange = getDateRangeForPreset(defaultPreset);

    return {
      dateRange: initialState?.dateRange || defaultDateRange,
      datePreset: initialState?.datePreset || defaultPreset,
      filters: initialState?.filters || {}
    };
  });

  // Handle preset change
  const handlePresetChange = useCallback((preset: DatePreset) => {
    const newState: AnalyticsFilterState = {
      ...filterState,
      datePreset: preset,
      dateRange: preset === 'custom' ? filterState.dateRange : getDateRangeForPreset(preset)
    };
    setFilterState(newState);
    onFilterChange?.(newState);
  }, [filterState, onFilterChange]);

  // Handle date range change
  const handleDateRangeChange = useCallback((field: 'startDate' | 'endDate', value: string) => {
    const newState: AnalyticsFilterState = {
      ...filterState,
      datePreset: 'custom',
      dateRange: {
        ...filterState.dateRange,
        [field]: value
      }
    };
    setFilterState(newState);
    onFilterChange?.(newState);
  }, [filterState, onFilterChange]);

  // Handle filter change
  const handleFilterChange = useCallback((groupId: string, value: string, multiSelect: boolean) => {
    const currentValues = filterState.filters[groupId] || [];
    let newValues: string[];

    if (multiSelect) {
      if (currentValues.includes(value)) {
        newValues = currentValues.filter(v => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
    } else {
      newValues = [value];
    }

    const newState: AnalyticsFilterState = {
      ...filterState,
      filters: {
        ...filterState.filters,
        [groupId]: newValues
      }
    };
    setFilterState(newState);
    onFilterChange?.(newState);
  }, [filterState, onFilterChange]);

  // Reset filters
  const handleReset = useCallback(() => {
    const defaultPreset: DatePreset = 'last30days';
    const newState: AnalyticsFilterState = {
      dateRange: getDateRangeForPreset(defaultPreset),
      datePreset: defaultPreset,
      filters: {}
    };
    setFilterState(newState);
    onFilterChange?.(newState);
  }, [onFilterChange]);

  // Check if filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.keys(filterState.filters).some(key => (filterState.filters[key]?.length || 0) > 0);
  }, [filterState.filters]);

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: theme.surface?.raised || '#ffffff',
    border: `1px solid ${theme.border?.default || '#e2e8f0'}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.text?.primary || '#1e293b',
    marginBottom: '8px'
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: '6px',
    border: `1px solid ${theme.border?.default || '#e2e8f0'}`,
    backgroundColor: theme.surface?.input || '#ffffff',
    color: theme.text?.primary || '#1e293b',
    fontSize: '14px',
    outline: 'none'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 500,
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: loading ? 0.6 : 1
  };

  const presetButtonStyle = (active: boolean): React.CSSProperties => ({
    ...buttonStyle,
    backgroundColor: active ? (theme.primary?.main || '#3b82f6') : 'transparent',
    color: active ? '#ffffff' : (theme.text?.primary || '#1e293b'),
    border: `1px solid ${active ? (theme.primary?.main || '#3b82f6') : (theme.border?.default || '#e2e8f0')}`
  });

  const checkboxStyle: React.CSSProperties = {
    marginRight: '8px',
    cursor: loading ? 'not-allowed' : 'pointer'
  };

  const optionLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    color: theme.text?.primary || '#1e293b',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center'
  };

  return (
    <div className={className} style={containerStyle}>
      {/* Date Range Section */}
      {showDateRange && (
        <div style={sectionStyle}>
          <label style={labelStyle}>Date Range</label>

          {/* Presets */}
          {showPresets && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {presets.map(preset => (
                <button
                  key={preset}
                  onClick={() => handlePresetChange(preset)}
                  style={presetButtonStyle(filterState.datePreset === preset)}
                  disabled={loading}
                >
                  {presetLabels[preset]}
                </button>
              ))}
            </div>
          )}

          {/* Custom Date Inputs */}
          {filterState.datePreset === 'custom' && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ ...labelStyle, fontSize: '12px' }}>Start Date</label>
                <input
                  type="date"
                  value={filterState.dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  style={inputStyle}
                  disabled={loading}
                />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={{ ...labelStyle, fontSize: '12px' }}>End Date</label>
                <input
                  type="date"
                  value={filterState.dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  style={inputStyle}
                  disabled={loading}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Groups */}
      {filterGroups.map(group => (
        <div key={group.id} style={sectionStyle}>
          <label style={labelStyle}>{group.label}</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.options.map(option => {
              const isSelected = (filterState.filters[group.id] || []).includes(option.value);
              return (
                <label key={option.value} style={optionLabelStyle}>
                  <input
                    type={group.multiSelect ? 'checkbox' : 'radio'}
                    name={group.id}
                    value={option.value}
                    checked={isSelected}
                    onChange={() => handleFilterChange(group.id, option.value, group.multiSelect || false)}
                    style={checkboxStyle}
                    disabled={loading}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Reset Button */}
      {(hasActiveFilters || filterState.datePreset !== 'last30days') && (
        <button
          onClick={handleReset}
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: 'transparent',
            color: theme.primary?.main || '#3b82f6',
            border: `1px solid ${theme.primary?.main || '#3b82f6'}`,
            alignSelf: 'flex-start'
          }}
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default AnalyticsFilters;
