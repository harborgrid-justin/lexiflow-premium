/**
 * @module components/atoms/Input
 * @category Atoms
 * @description Input component with theme support and validation.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React, { useId } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/theme';

// Utils & Constants
import { cn } from '@/shared/lib/cn';
import { labelStyles, getInputStyles, errorStyles } from './Input.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

/**
 * Input component with React 18 accessibility enhancements
 * Uses useId for SSR-safe, unique IDs
 */
export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  const { mode } = useTheme();
  // React 18: useId generates stable, unique IDs for accessibility
  const inputId = useId();
  const errorId = useId();
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className={labelStyles}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          getInputStyles(!!error),
          className
        )}
        style={mode === 'dark' ? { colorScheme: 'dark' } : {}}
        {...props}
      />
      {error && (
        <p id={errorId} role="alert" className={errorStyles}>
          {error}
        </p>
      )}
    </div>
  );
};
