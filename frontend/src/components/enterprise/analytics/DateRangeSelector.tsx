/**
 * DateRangeSelector Component
 * Allows users to select date ranges for analytics
 */

import { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from 'date-fns';

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export interface DateRangeSelectorProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: DatePreset[];
  className?: string;
}

export interface DatePreset {
  label: string;
  value: string;
  getRange: () => DateRange;
}

const defaultPresets: DatePreset[] = [
  {
    label: 'Last 7 Days',
    value: '7d',
    getRange: () => ({
      start: subDays(new Date(), 7),
      end: new Date(),
      label: 'Last 7 Days',
    }),
  },
  {
    label: 'Last 30 Days',
    value: '30d',
    getRange: () => ({
      start: subDays(new Date(), 30),
      end: new Date(),
      label: 'Last 30 Days',
    }),
  },
  {
    label: 'Last 90 Days',
    value: '90d',
    getRange: () => ({
      start: subDays(new Date(), 90),
      end: new Date(),
      label: 'Last 90 Days',
    }),
  },
  {
    label: 'This Month',
    value: 'mtd',
    getRange: () => ({
      start: startOfMonth(new Date()),
      end: new Date(),
      label: 'This Month',
    }),
  },
  {
    label: 'Last Month',
    value: 'lm',
    getRange: () => ({
      start: startOfMonth(subMonths(new Date(), 1)),
      end: endOfMonth(subMonths(new Date(), 1)),
      label: 'Last Month',
    }),
  },
  {
    label: 'This Year',
    value: 'ytd',
    getRange: () => ({
      start: startOfYear(new Date()),
      end: new Date(),
      label: 'This Year',
    }),
  },
];

export function DateRangeSelector({
  value,
  onChange,
  presets = defaultPresets,
  className = '',
}: DateRangeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(format(value.start, 'yyyy-MM-dd'));
  const [customEnd, setCustomEnd] = useState(format(value.end, 'yyyy-MM-dd'));

  const handlePresetClick = (preset: DatePreset) => {
    onChange(preset.getRange());
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    onChange({
      start: new Date(customStart),
      end: new Date(customEnd),
      label: 'Custom Range',
    });
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <Calendar className="h-4 w-4" />
        <span>{value.label}</span>
        <span className="text-gray-500 dark:text-gray-400">
          {format(value.start, 'MMM d')} - {format(value.end, 'MMM d, yyyy')}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 z-20 mt-2 w-96 rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Presets */}
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Quick Select
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => handlePresetClick(preset)}
                    className="rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range */}
            <div className="p-4">
              <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                Custom Range
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
                <button
                  onClick={handleCustomApply}
                  className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
