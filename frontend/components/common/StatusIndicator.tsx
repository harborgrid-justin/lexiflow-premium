/**
 * StatusIndicator.tsx
 * 
 * Reusable status indicator component with consistent styling
 * Replaces repeated status badge patterns across components
 */

import React from 'react';
import { cn } from '../../utils/cn';

// ============================================================================
// TYPES
// ============================================================================
export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface StatusIndicatorProps {
  /** Status type determines color scheme */
  type: StatusType;
  /** Display text */
  label: string;
  /** Optional custom className */
  className?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show animated pulse indicator */
  pulse?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const STATUS_CLASSES: Record<StatusType, string> = {
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  neutral: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

const SIZE_CLASSES: Record<NonNullable<StatusIndicatorProps['size']>, string> = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5'
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * StatusIndicator - Consistent status badge component
 * 
 * @example
 * ```tsx
 * <StatusIndicator type="success" label="On Track" />
 * <StatusIndicator type="error" label="Breached" pulse />
 * <StatusIndicator type="warning" label="At Risk" size="sm" />
 * ```
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  type,
  label,
  className,
  size = 'md',
  pulse = false
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold rounded uppercase',
        STATUS_CLASSES[type],
        SIZE_CLASSES[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {pulse && (
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
        </span>
      )}
      {label}
    </span>
  );
};
