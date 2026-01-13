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
// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Components
import { Badge } from '../Badge/Badge';

// Utils & Constants
import { cn } from '@/shared/lib/cn';
import { StatusRegistry } from '@/utils/statusRegistry';
import React from "react";

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
/**
 * StatusBadge - React 18 optimized with React.memo
 */
export const StatusBadge = React.memo<StatusBadgeProps>(({ status, className, variantOverride }) => {
  const variant = variantOverride || StatusRegistry.getVariant(status);

  return (
    <Badge variant={variant} className={cn("whitespace-nowrap", className)}>
      {status}
    </Badge>
  );
});
