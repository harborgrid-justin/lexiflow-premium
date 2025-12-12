
import React from 'react';
import { Badge } from './Badge';
import { StatusRegistry } from '../../utils/statusRegistry';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: string;
  className?: string;
  variantOverride?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
}

/**
 * Standardized Status Badge component.
 * Automatically determines color based on status text using the StatusRegistry.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className, variantOverride }) => {
  const variant = variantOverride || StatusRegistry.getVariant(status);
  
  return (
    <Badge variant={variant} className={cn("whitespace-nowrap", className)}>
      {status}
    </Badge>
  );
};
