/**
 * ProgressBarWithLabel.tsx
 * 
 * Reusable progress bar with label component
 * Replaces repeated progress bar patterns across components
 */

import React from 'react';
import { cn } from '@/utils/cn';

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
const VARIANT_CLASSES: Record<ProgressVariant, string> = {
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-slate-500'
};

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
  const clampedValue = Math.min(100, Math.max(0, value));

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
      <div className="w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={cn(
            'rounded-full',
            HEIGHT_CLASSES[height],
            VARIANT_CLASSES[variant],
            animated && 'transition-all duration-300'
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};
