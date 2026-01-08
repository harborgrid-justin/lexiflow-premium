'use client';

/**
 * ComparisonSelector Component
 * Allows selection of comparison periods (YoY, MoM, WoW)
 *
 * @component
 */

import { cn } from '@/lib/utils';
import type { ComparisonPeriod } from '@/types/analytics-module';
import * as React from 'react';

interface ComparisonSelectorProps {
  value: ComparisonPeriod;
  onChange: (period: ComparisonPeriod) => void;
  className?: string;
}

const COMPARISON_OPTIONS: Array<{ value: ComparisonPeriod; label: string; shortLabel: string }> = [
  { value: 'wow', label: 'Week over Week', shortLabel: 'WoW' },
  { value: 'mom', label: 'Month over Month', shortLabel: 'MoM' },
  { value: 'yoy', label: 'Year over Year', shortLabel: 'YoY' },
];

export function ComparisonSelector({
  value,
  onChange,
  className,
}: ComparisonSelectorProps): React.JSX.Element {
  return (
    <div className={cn('inline-flex rounded-lg bg-slate-100 p-1 dark:bg-slate-800', className)}>
      {COMPARISON_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
            value === option.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
          title={option.label}
        >
          {option.shortLabel}
        </button>
      ))}
    </div>
  );
}

ComparisonSelector.displayName = 'ComparisonSelector';
