/**
 * Reusable select field with label and error display
 */

import { cn } from '@/shared/lib/cn';

export interface FormSelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  placeholder,
}) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
        {label} {required && '*'}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-2 border rounded-lg",
          error
            ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900"
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
};
