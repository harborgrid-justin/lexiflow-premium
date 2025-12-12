/**
 * Enhanced Input Component
 * Feature-rich input with validation, icons, and various types
 */

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, Search, AlertCircle, CheckCircle, X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../context/ThemeContext';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ElementType;
  rightIcon?: React.ElementType;
  clearable?: boolean;
  onClear?: () => void;
  showValidation?: boolean;
  isValid?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      clearable = false,
      onClear,
      showValidation = false,
      isValid,
      inputSize = 'md',
      fullWidth = true,
      className,
      type = 'text',
      value,
      disabled,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPasswordType = type === 'password';
    const actualType = isPasswordType && showPassword ? 'text' : type;
    const hasValue = value !== undefined && value !== '';

    const sizeClasses = {
      sm: 'h-8 text-xs px-2.5',
      md: 'h-10 text-sm px-3',
      lg: 'h-12 text-base px-4',
    };

    const showClearButton = clearable && hasValue && !disabled;
    const showPasswordToggle = isPasswordType && !disabled;
    const showValidationIcon = showValidation && !disabled && hasValue;

    const paddingLeft = LeftIcon ? 'pl-10' : '';
    const paddingRight = cn(
      (showPasswordToggle || showClearButton || showValidationIcon || RightIcon) && 'pr-10'
    );

    const handleClear = () => {
      if (onClear) {
        onClear();
      }
    };

    return (
      <div className={cn('space-y-1.5', fullWidth ? 'w-full' : 'w-auto')}>
        {label && (
          <label
            className={cn(
              'block text-xs font-semibold uppercase tracking-wide',
              theme.text.secondary,
              disabled && 'opacity-50'
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {LeftIcon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none',
                theme.text.tertiary,
                disabled && 'opacity-50'
              )}
            >
              <LeftIcon className="h-4 w-4" />
            </div>
          )}

          <input
            ref={ref}
            type={actualType}
            value={value}
            disabled={disabled}
            className={cn(
              'w-full border rounded-md shadow-sm outline-none transition-all',
              'placeholder:text-slate-400 dark:placeholder:text-slate-600',
              sizeClasses[inputSize],
              paddingLeft,
              paddingRight,
              theme.surface.input,
              theme.text.primary,
              error
                ? theme.border.error
                : isFocused
                ? cn(theme.border.default, theme.border.focused)
                : theme.border.default,
              disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {showValidationIcon && (
              <>
                {isValid ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
              </>
            )}

            {showClearButton && (
              <button
                type="button"
                onClick={handleClear}
                className={cn(
                  'hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5 transition-colors',
                  theme.text.tertiary
                )}
                aria-label="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {showPasswordToggle && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-0.5 transition-colors',
                  theme.text.tertiary
                )}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {RightIcon && !showPasswordToggle && !showClearButton && (
              <RightIcon className={cn('h-4 w-4', theme.text.tertiary)} />
            )}
          </div>
        </div>

        {(error || helperText) && (
          <div className="min-h-[1.25rem]">
            {error && (
              <p
                id={`${props.id}-error`}
                className={cn('text-xs font-medium', theme.status.error.text)}
                role="alert"
              >
                {error}
              </p>
            )}
            {!error && helperText && (
              <p
                id={`${props.id}-helper`}
                className={cn('text-xs', theme.text.tertiary)}
              >
                {helperText}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Search Input variant
export const SearchInput = forwardRef<HTMLInputElement, Omit<InputProps, 'leftIcon'>>(
  (props, ref) => {
    return <Input ref={ref} leftIcon={Search} {...props} />;
  }
);

SearchInput.displayName = 'SearchInput';

// TextArea Component
export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      resize = 'vertical',
      className,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const charCount = value ? String(value).length : 0;
    const showCount = showCharCount && maxLength;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            className={cn(
              'block text-xs font-semibold uppercase tracking-wide',
              theme.text.secondary,
              disabled && 'opacity-50'
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2 border rounded-md shadow-sm outline-none transition-all min-h-[80px]',
            'placeholder:text-slate-400 dark:placeholder:text-slate-600',
            resizeClasses[resize],
            theme.surface.input,
            theme.text.primary,
            error
              ? theme.border.error
              : isFocused
              ? cn(theme.border.default, theme.border.focused)
              : theme.border.default,
            disabled && 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800',
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />

        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-h-[1.25rem]">
            {error && (
              <p className={cn('text-xs font-medium', theme.status.error.text)} role="alert">
                {error}
              </p>
            )}
            {!error && helperText && (
              <p className={cn('text-xs', theme.text.tertiary)}>{helperText}</p>
            )}
          </div>

          {showCount && (
            <span
              className={cn(
                'text-xs shrink-0',
                charCount > maxLength ? theme.status.error.text : theme.text.tertiary
              )}
            >
              {charCount} / {maxLength}
            </span>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';

export default Input;
