'use client';

/**
 * @deprecated Use @/components/ui/shadcn/button instead
 * Adapter component for backward compatibility
 */

import { Button as ShadcnButton } from '@/components/ui/shadcn/button';
import { ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'default' | 'destructive' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'default' | 'icon';

interface LegacyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  asChild?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  ...props
}: LegacyButtonProps) {
  // Map legacy variants to shadcn variants
  const getVariant = (v: ButtonVariant) => {
    switch (v) {
      case 'primary': return 'default';
      case 'danger': return 'destructive';
      default: return v as any;
    }
  };

  // Map legacy sizes to shadcn sizes
  const getSize = (s: ButtonSize) => {
    switch (s) {
      case 'md': return 'default';
      default: return s as any;
    }
  };

  return (
    <ShadcnButton
      variant={getVariant(variant)}
      size={getSize(size)}
      loading={loading}
      fullWidth={fullWidth}
      className={className}
      {...props}
    >
      {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && !loading && <span className="ml-2">{icon}</span>}
    </ShadcnButton>
  );
}
