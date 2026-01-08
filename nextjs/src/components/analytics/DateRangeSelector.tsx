'use client';

/**
 * DateRangeSelector Component
 * Allows selection of predefined date ranges or custom dates
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
import type { DateRange } from '@/types/analytics-module';
import { Calendar } from 'lucide-react';
import * as React from 'react';

interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

const PRESET_RANGES: Array<{ label: string; days: number }> = [
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last Year', days: 365 },
  { label: 'Year to Date', days: -1 }, // Special case
  { label: 'All Time', days: -2 }, // Special case
];

function getDateRange(days: number): DateRange {
  const end = new Date();
  let start: Date;
  let label: string;

  if (days === -1) {
    // Year to date
    start = new Date(end.getFullYear(), 0, 1);
    label = 'Year to Date';
  } else if (days === -2) {
    // All time - 5 years back
    start = new Date(end.getFullYear() - 5, 0, 1);
    label = 'All Time';
  } else {
    start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    label = PRESET_RANGES.find((r) => r.days === days)?.label || `Last ${days} Days`;
  }

  return { start, end, label };
}

export function DateRangeSelector({
  value,
  onChange,
  className,
}: DateRangeSelectorProps): React.JSX.Element {
  const handlePresetChange = React.useCallback(
    (presetLabel: string) => {
      const preset = PRESET_RANGES.find((r) => r.label === presetLabel);
      if (preset) {
        onChange(getDateRange(preset.days));
      }
    },
    [onChange]
  );

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select value={value.label} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]">
          <Calendar className="mr-2 h-4 w-4 text-slate-500" />
          <SelectValue placeholder="Select range" />
        </SelectTrigger>
        <SelectContent>
          {PRESET_RANGES.map((preset) => (
            <SelectItem key={preset.label} value={preset.label}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

DateRangeSelector.displayName = 'DateRangeSelector';
