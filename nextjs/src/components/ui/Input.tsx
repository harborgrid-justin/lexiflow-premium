'use client';

/**
 * @deprecated Use @/components/ui/shadcn/input and form primitives instead
 * Adapter component for backward compatibility
 */

import { Input as ShadcnInput } from '@/components/ui/shadcn/input';
import { Label } from '@/components/ui/shadcn/label';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { ReactNode } from 'react';

interface LegacyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, LegacyInputProps>(({
  label,
  error,
  helperText,
  icon,
  clearable,
  onClear,
  className,
  required,
  inputSize = 'md',
  fullWidth = true,
  ...props
}, ref) => {
  return (
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <Label className={cn(error && "text-destructive")}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
            {icon}
          </div>
        )}

        <ShadcnInput
          ref={ref}
          inputSize={inputSize}
          fullWidth={fullWidth}
          error={!!error}
          className={cn(
            icon && "pl-9",
            clearable && "pr-9"
          )}
          {...props}
        />

        {clearable && props.value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error ? (
        <p className="text-sm font-medium text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
