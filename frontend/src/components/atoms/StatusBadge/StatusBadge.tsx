/**
 * @module components/common/StatusBadge
 * @category Common
 * @description Status badge with automatic color mapping.
 *
 * THEME SYSTEM USAGE:
 * Uses StatusRegistry to determine color variants.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Badge } from '@/components/atoms/Badge';

// Utils & Constants
import { StatusRegistry } from '@/utils/statusRegistry';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
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
