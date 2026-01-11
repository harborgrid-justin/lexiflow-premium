/**
 * Reusable textarea field with label
 */

import React from 'react';
import { cn } from '@/shared/lib/cn';

export interface FormTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  rows = 4,
  disabled,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label} {required && '*'}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "w-full px-4 py-2 border rounded-lg",
          error
            ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
        )}
      />
      {error && (
        <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};
