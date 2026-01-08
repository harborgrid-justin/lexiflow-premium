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
import { Loader2 } from 'lucide-react';
import React from 'react';

import { Button as ShadcnButton, ButtonProps as ShadcnButtonProps } from '@/components/ui/shadcn/button';
import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  icon?: React.ElementType;
  isLoading?: boolean;
  children?: React.ReactNode;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  isLoading,
  children,
  className = '',
  disabled,
  ...props
}, ref) => {
  // Map legacy variants to shadcn variants
  const getVariant = (v: string): ShadcnButtonProps['variant'] => {
    switch (v) {
      case 'primary': return 'default';
      case 'danger': return 'destructive';
      case 'secondary': return 'secondary';
      case 'outline': return 'outline';
      case 'ghost': return 'ghost';
      case 'link': return 'link';
      default: return 'default';
    }
  };

  // Map legacy sizes to shadcn sizes
  const getSize = (s: string): ShadcnButtonProps['size'] => {
    switch (s) {
      case 'xs': return 'sm'; // Map xs to sm as shadcn doesn't have xs
      case 'sm': return 'sm';
      case 'md': return 'default';
      case 'lg': return 'lg';
      case 'icon': return 'icon';
      default: return 'default';
    }
  };

  return (
    <ShadcnButton
      ref={ref}
      variant={getVariant(variant)}
      size={getSize(size)}
      className={className}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
      {Icon && !isLoading && <Icon className={cn("h-4 w-4", children ? "mr-2" : "")} />}
      {children}
    </ShadcnButton>
  );
});

Button.displayName = 'Button';
