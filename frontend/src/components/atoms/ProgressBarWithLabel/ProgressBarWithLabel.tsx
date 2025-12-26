/**
 * ProgressBarWithLabel.tsx
 * 
 * Reusable progress bar with label component
 * Replaces repeated progress bar patterns across components
 */

import React from 'react';
import { cn } from '@/utils/cn';
import { useTheme } from '@/providers/ThemeContext';

// ============================================================================
// TYPES
// ============================================================================
export type ProgressVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface ProgressBarWithLabelProps {
  /** Progress value (0-100) */
  value: number;
  /** Label text */
  label?: string;
  /** Color variant */
  variant?: ProgressVariant;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Custom className */
  className?: string;
  /** Height of bar */
  height?: 'sm' | 'md' | 'lg';
  /** Animate transitions */
  animated?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HEIGHT_CLASSES: Record<NonNullable<ProgressBarWithLabelProps['height']>, string> = {
  sm: 'h-1',
  md: 'h-1.5',
  lg: 'h-2'
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProgressBarWithLabel - Labeled progress bar component
 * 
 * @example
 * ```tsx
 * <ProgressBarWithLabel value={75} label="Task Progress" />
 * <ProgressBarWithLabel value={90} variant="success" showPercentage />
 * <ProgressBarWithLabel value={25} variant="error" height="lg" />
 * ```
 */
export const ProgressBarWithLabel: React.FC<ProgressBarWithLabelProps> = ({
  value,
  label,
  variant = 'info',
  showPercentage = false,
  className,
  height = 'md',
  animated = true
}) => {
  const { theme } = useTheme();
  const clampedValue = Math.min(100, Math.max(0, value));
  
  // Map variant to theme colors
  const variantClasses = {
    success: theme.status.success.bg,
    warning: theme.status.warning.bg,
    error: theme.status.error.bg,
    info: theme.accent.primary,
    neutral: theme.status.neutral.bg
  };

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && <span className="font-medium truncate">{label}</span>}
          {showPercentage && (
            <span className="text-xs font-mono font-bold ml-2">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full overflow-hidden', theme.surface.muted)}>
        <div
          className={cn(
            'rounded-full',
            HEIGHT_CLASSES[height],
            variantClasses[variant],
            animated && 'transition-all duration-300'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
