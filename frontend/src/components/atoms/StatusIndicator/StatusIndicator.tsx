/**
 * StatusIndicator.tsx
 * 
 * Reusable status indicator component with consistent styling
 * Replaces repeated status badge patterns across components
 */

import React from 'react';
import { cn } from '@/lib/cn';
import { useTheme } from "@/hooks/useTheme";

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
export const StatusIndicator = React.memo<StatusIndicatorProps>(({
  type,
  label,
  className,
  size = 'md',
  pulse = false
}) => {
  const { theme } = useTheme();
  
  // Map type to theme status classes
  const statusClasses = {
    success: cn(theme.status.success.bg, theme.status.success.text),
    warning: cn(theme.status.warning.bg, theme.status.warning.text),
    error: cn(theme.status.error.bg, theme.status.error.text),
    info: cn(theme.status.info.bg, theme.status.info.text),
    neutral: cn(theme.status.neutral.bg, theme.status.neutral.text)
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold rounded uppercase',
        statusClasses[type],
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
});
