/**
 * @module components/common/Button
 * @category Common
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
import { useTheme } from '../../context/ThemeContext';

// Utils & Constants
import { cn } from '../../utils/cn';

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

  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed rounded-md gap-2 border shadow-sm";
  
  const variants = {
    primary: cn(theme.action.primary.bg, theme.action.primary.text, theme.action.primary.hover, theme.action.primary.border, theme.border.focused),
    secondary: cn(theme.action.secondary.bg, theme.action.secondary.text, theme.action.secondary.hover, theme.action.secondary.border),
    outline: cn("bg-transparent border", theme.border.default, theme.text.primary, `hover:${theme.surface.highlight}`),
    ghost: cn(theme.action.ghost.bg, theme.action.ghost.text, theme.action.ghost.hover, "border-transparent shadow-none"),
    danger: cn(theme.action.danger.bg, theme.action.danger.text, theme.action.danger.hover, theme.action.danger.border, theme.border.error),
    link: "text-blue-600 hover:underline bg-transparent border-none shadow-none p-0 h-auto"
  };

  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
    icon: "p-2"
  };

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
