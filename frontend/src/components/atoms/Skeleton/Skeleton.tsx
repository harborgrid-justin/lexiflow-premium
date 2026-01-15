import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/theme';
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
  const { theme } = useTheme();
  const styles = {
    width,
    height,
    backgroundColor: theme.surface.muted,
    ...style
  };

  return (
    <div
      className={cn(
        "animate-pulse",
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
