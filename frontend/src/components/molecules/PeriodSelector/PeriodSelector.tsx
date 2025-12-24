/**
 * @module components/common/PeriodSelector
 * @category Common
 * @description Period selector with predefined options.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '../../context/ThemeContext';

// Utils & Constants
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface PeriodOption {
  value: string;
  label: string;
}

interface PeriodSelectorProps {
  periods?: PeriodOption[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

const DEFAULT_PERIODS: PeriodOption[] = [
  { value: '30d', label: 'Last 30 Days' },
  { value: 'QTD', label: 'Quarter to Date' },
  { value: 'YTD', label: 'Year to Date' },
  { value: 'ALL', label: 'All Time' },
];

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({ 
  periods = DEFAULT_PERIODS, 
  selected, 
  onChange, 
  className = '' 
}) => {
  const { theme } = useTheme();

  return (
    <div className={cn("inline-flex p-1 rounded-lg border", theme.surface.default, theme.border.default, className)}>
      {periods.map((period) => {
        const isActive = selected === period.value;
        return (
          <button
            key={period.value}
            onClick={() => onChange(period.value)}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200",
              isActive 
                ? cn(theme.primary.DEFAULT, theme.text.inverse, "shadow-sm") 
                : cn(theme.text.secondary, `hover:${theme.surface.highlight}`, `hover:${theme.text.primary}`)
            )}
          >
            {period.label}
          </button>
        );
      })}
    </div>
  );
};
