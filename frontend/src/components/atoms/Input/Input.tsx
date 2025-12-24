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
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';
import { labelStyles, getInputStyles, errorStyles } from './Input.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({ label, error, className = '', ...props }: InputProps) => {
  const { theme, mode } = useTheme();
  
  return (
    <div className="w-full">
      {label && <label className={labelStyles(theme)}>{label}</label>}
      <input
        className={cn(
          getInputStyles(theme, !!error, mode),
          className
        )}
        style={mode === 'dark' ? { colorScheme: 'dark' } : {}}
        {...props}
      />
      {error && <p className={errorStyles(theme)}>{error}</p>}
    </div>
  );
};
