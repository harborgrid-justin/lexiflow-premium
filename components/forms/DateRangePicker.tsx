import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, X } from 'lucide-react';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value?: DateRange;
  onChange: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value = { start: null, end: null },
  onChange,
  label,
  placeholder,
  required,
  minDate,
  maxDate,
  className = '',
}) => {
  const [range, setRange] = useState<DateRange>(value);

  const handleStartChange = (date: string) => {
    const newRange = { ...range, start: date ? new Date(date) : null };
    setRange(newRange);
    onChange(newRange);
  };

  const handleEndChange = (date: string) => {
    const newRange = { ...range, end: date ? new Date(date) : null };
    setRange(newRange);
    onChange(newRange);
  };

  const handleClear = () => {
    const newRange = { start: null, end: null };
    setRange(newRange);
    onChange(newRange);
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toISOString().split('T')[0] : '';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={className}
    >
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={formatDate(range.start)}
            onChange={(e) => handleStartChange(e.target.value)}
            min={minDate ? formatDate(minDate) : undefined}
            max={range.end ? formatDate(range.end) : maxDate ? formatDate(maxDate) : undefined}
            placeholder={placeholder || 'Start date'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <span className="text-gray-500 dark:text-gray-400">to</span>

        <div className="flex-1 relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="date"
            value={formatDate(range.end)}
            onChange={(e) => handleEndChange(e.target.value)}
            min={range.start ? formatDate(range.start) : minDate ? formatDate(minDate) : undefined}
            max={maxDate ? formatDate(maxDate) : undefined}
            placeholder={placeholder || 'End date'}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {(range.start || range.end) && (
          <button
            onClick={handleClear}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Clear dates"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default DateRangePicker;
