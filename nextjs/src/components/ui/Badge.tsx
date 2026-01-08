'use client';

/**
 * @deprecated Use @/components/ui/shadcn/badge instead
 * Adapter component for backward compatibility
 */

import { Badge as ShadcnBadge } from '@/components/ui/shadcn/badge';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'secondary'
  | 'outline'
  | 'destructive';

type BadgeSize = 'sm' | 'md' | 'lg';

interface LegacyBadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: LegacyBadgeProps) {
  
  const getVariant = (v: BadgeVariant) => {
    switch (v) {
      case 'primary': return 'default';
      case 'danger': return 'destructive';
      default: return v as any;
    }
  };

  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <ShadcnBadge
      variant={getVariant(variant)}
      className={cn(sizeClasses[size], className)}
    >
      {icon && <span className="mr-1.5 flex items-center">{icon}</span>}
      {children}
    </ShadcnBadge>
  );
}
