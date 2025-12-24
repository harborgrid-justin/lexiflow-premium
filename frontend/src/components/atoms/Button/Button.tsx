/**
 * @module components/atoms/Button
 * @category Atoms
 * @description Button component with variants and loading state.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/providers/ThemeContext';

// Utils & Constants
import { cn } from '@/utils/cn';
import { baseStyles, getVariants, sizes } from './Button.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ElementType;
  isLoading?: boolean;
  children?: React.ReactNode;
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const { theme } = useTheme();
  const variants = getVariants(theme);

  const ariaLabel = props['aria-label'] || (typeof children === 'string' ? children : undefined);

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      aria-label={ariaLabel}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {Icon && !isLoading && <Icon className={cn("h-4 w-4", children ? "mr-0" : "")} />}
      {children}
    </button>
  );
};
