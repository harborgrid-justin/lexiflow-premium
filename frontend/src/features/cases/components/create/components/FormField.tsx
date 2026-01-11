/**
 * Reusable form field with label, input, and error display
 */

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface FormFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: 'text' | 'date' | 'number' | 'email' | 'tel';
  disabled?: boolean;
  helpText?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  type = 'text',
  disabled,
  helpText,
  min,
  max,
  step,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label} {required && '*'}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={cn(
          "w-full px-4 py-2 border rounded-lg",
          error
            ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900",
          disabled && "bg-slate-100 dark:bg-slate-700"
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
      {helpText && !error && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helpText}</p>
      )}
    </div>
  );
};
