/**
 * FormInput Component
 * Reusable form input with validation and error display
 */

import { cn } from '@/lib/cn';
import { useTheme } from "@/hooks/useTheme";
import { AlertCircle } from 'lucide-react';
interface FormInputProps {
  label: string;
  field: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  value: string | number;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function FormInput({
  label,
  type = 'text',
  required = false,
  placeholder,
  helperText,
  value,
  error,
  onChange,
  onBlur,
}: FormInputProps) {
  const { theme } = useTheme();

  return (
    <div>
      <label className={cn('block text-sm font-medium mb-1', theme.text.primary)}>
        {label} {required && <span className="text-rose-600">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(
          'w-full px-3 py-2 rounded-lg border transition-colors',
          error ? 'border-rose-600' : theme.border.default,
          theme.surface.default,
          theme.text.primary
        )}
      />
      {helperText && !error && (
        <p className={cn('text-xs mt-1', theme.text.secondary)}>{helperText}</p>
      )}
      {error && (
        <p className="text-xs mt-1 text-rose-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
};
