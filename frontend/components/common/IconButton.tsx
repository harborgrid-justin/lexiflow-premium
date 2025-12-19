/**
 * IconButton.tsx
 * 
 * Reusable icon button component with consistent styling
 * Replaces repeated inline button patterns
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES
// ============================================================================
export type IconButtonVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Visual style variant */
  variant?: IconButtonVariant;
  /** Size of button */
  size?: IconButtonSize;
  /** Accessible label (required for screen readers) */
  'aria-label': string;
  /** Show tooltip */
  tooltip?: string;
  /** Make button circular */
  rounded?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const VARIANT_CLASSES: Record<IconButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-slate-600 hover:bg-slate-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  warning: 'bg-amber-600 hover:bg-amber-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
};

const SIZE_CLASSES: Record<IconButtonSize, { button: string; icon: string }> = {
  sm: { button: 'p-1.5', icon: 'h-3.5 w-3.5' },
  md: { button: 'p-2', icon: 'h-5 w-5' },
  lg: { button: 'p-3', icon: 'h-6 w-6' }
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * IconButton - Consistent icon button component
 * 
 * @example
 * ```tsx
 * <IconButton icon={Play} variant="success" aria-label="Start" />
 * <IconButton icon={Pause} variant="warning" aria-label="Pause" size="lg" />
 * <IconButton icon={StopCircle} variant="danger" aria-label="Stop" rounded />
 * ```
 */
export const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  variant = 'primary',
  size = 'md',
  'aria-label': ariaLabel,
  tooltip,
  rounded = true,
  className,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size].button,
        rounded ? 'rounded-full' : 'rounded-md',
        className
      )}
      aria-label={ariaLabel}
      title={tooltip || ariaLabel}
      disabled={disabled}
      {...props}
    >
      <Icon className={cn(SIZE_CLASSES[size].icon, disabled ? 'opacity-50' : 'fill-current')} />
    </button>
  );
};
