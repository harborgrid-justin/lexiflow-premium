/**
 * Currency input with $ prefix styling
 */

import React from 'react';

import { cn } from '@/lib/cn';

export interface CurrencyInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  isPercentage?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  isPercentage = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value) || 0;
    onChange(parsed);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label} {required && '*'}
      </label>
      <div className="relative">
        {!isPercentage && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
        )}
        <input
          id={id}
          type="number"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          step="0.01"
          min="0"
          max={isPercentage ? 100 : undefined}
          className={cn(
            "w-full py-2 border rounded-lg",
            isPercentage ? "px-4 pr-10" : "pl-8 pr-4",
            error
              ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
              : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
          )}
        />
        {isPercentage && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500">%</span>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};
