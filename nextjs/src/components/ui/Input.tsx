'use client';

/**
 * Input Component - Reusable form input
 * Supports text, email, password, number, etc.
 */

import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  clearable,
  onClear,
  value,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
          {props.required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}

        <input
          value={value}
          className={`
            w-full px-4 py-2 rounded-lg
            border border-slate-300 dark:border-slate-600
            bg-white dark:bg-slate-900
            text-slate-900 dark:text-slate-50
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600
            focus:border-transparent
            transition-colors
            disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed
            ${icon ? 'pl-10' : ''}
            ${clearable && value ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        />

        {clearable && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}
