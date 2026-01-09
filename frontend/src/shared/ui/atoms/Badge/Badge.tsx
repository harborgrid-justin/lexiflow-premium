/**
 * @module components/atoms/Badge
 * @category Atoms
 * @description Status badge with variant colors.
 *
 * THEME SYSTEM USAGE:
 * Uses useTheme hook to apply semantic colors.
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Hooks & Context
import { useTheme } from '@/contexts/theme/ThemeContext';

// Utils & Constants
import { cn } from '@/shared/lib/cn';
import { baseBadgeStyles, getBadgeSizeStyles, getBadgeVariantStyles } from './Badge.styles';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export interface BadgeProps {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

/**
 * Badge - React 18 optimized with React.memo
 */
export const Badge = React.memo<BadgeProps>(({ variant = 'neutral', size = 'md', children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <span className={cn(
      baseBadgeStyles,
      getBadgeVariantStyles(theme, variant),
      getBadgeSizeStyles(size),
      className
    )}>
      {children}
    </span>
  );
});
