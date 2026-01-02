'use client';

/**
 * Select/Dropdown Component - Reusable select dropdown
 */

import { ChevronDown } from 'lucide-react';
import { ReactNode, useState } from 'react';

interface SelectOption {
  value: string | number;
  label: string;
  icon?: ReactNode;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full px-4 py-2 rounded-lg
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-900
            text-slate-900 dark:text-slate-50
            text-left flex items-center justify-between
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
            transition-colors
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
          `}
        >
          <span className={selectedOption ? '' : 'text-slate-400'}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange?.(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2 text-left flex items-center gap-2 text-sm
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  border-b border-slate-100 dark:border-slate-800 last:border-b-0
                  transition-colors
                  ${value === option.value
                    ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-slate-900 dark:text-slate-50'
                  }
                `}
              >
                {option.icon && <span>{option.icon}</span>}
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
