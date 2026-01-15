/**
 * LoadingState.tsx
 *
 * Reusable loading state component
 * Replaces repeated loading UI patterns
 */

import { cn } from '@/shared/lib/cn';
import { Loader2 } from 'lucide-react';
import React from 'react';

// ============================================================================
// TYPES
// ============================================================================
export interface LoadingStateProps {
  /** Loading message */
  message?: string;
  /** Size of spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Center in container */
  centered?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const SIZE_CLASSES = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
} as const;

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * LoadingState - Consistent loading UI component
 *
 * @example
 * ```tsx
 * <LoadingState message="Loading data..." />
 * <LoadingState size="sm" centered />
 * ```
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message,
  size = 'md',
  centered = true,
  className
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3',
        centered && 'justify-center p-10',
        className
      )}
    >
      <Loader2 className={cn('animate-spin', theme.colors.primary, SIZE_CLASSES[size])} />
      {message && (
        <p style={{ color: 'var(--color-textMuted)' }} className="text-sm">{message}</p>
      )}
    </div>
  );
};
