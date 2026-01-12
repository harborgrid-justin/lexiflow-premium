import { cn } from '@/shared/lib/cn';
import { HTMLAttributes } from 'react';

/**
 * Skeleton Properties
 * @property width - Exact width to reserve space (Zero Layout Shift)
 * @property height - Exact height to reserve space (Zero Layout Shift)
 */
export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'circle' | 'rect' | 'text';
}

/**
 * Skeleton Component
 *
 * REQUIREMENTS ADDRESSED:
 * - ZERO LAYOUT SHIFT GUARANTEE: Skeletons match exact width/height
 *
 * Usage:
 * <Skeleton width={200} height={40} />
 */
export function Skeleton({
  width,
  height,
  variant = 'rect',
  className,
  style,
  ...props
}: SkeletonProps) {
  const styles = {
    width,
    height,
    ...style
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 dark:bg-gray-700/50",
        variant === 'circle' && "rounded-full",
        variant === 'rect' && "rounded-md",
        variant === 'text' && "rounded h-4 w-full",
        className
      )}
      style={styles}
      // ARIA attributes for accessibility performance
      aria-hidden="true"
      {...props}
    />
  );
}
