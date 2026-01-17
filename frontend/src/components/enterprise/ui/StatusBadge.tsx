/**
 * @module enterprise/ui/StatusBadge
 * @category Enterprise UI
 * @description Enhanced status badge with animations and variants
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { motion } from 'framer-motion';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import React from "react";

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type StatusVariant =
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'active'
  | 'inactive'
  | 'neutral';

export interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showDot?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'neutral',
  size = 'md',
  animated = false,
  showDot = true,
  className }) => {
  const { theme } = useTheme();

  const variants: Record<StatusVariant, string> = {
    success: cn('border', theme.status.success.text, theme.status.success.background),
    warning: cn('border', theme.status.warning.text, theme.status.warning.background),
    error: cn('border', theme.status.error.text, theme.status.error.background),
    info: cn('border', theme.colors.info, 'dark:bg-blue-900/20 dark:border-blue-800'),
    pending: cn('border', theme.surface.card, theme.text.secondary, 'dark:border-slate-700'),
    active: cn('border', theme.status.success.text, theme.status.success.background),
    inactive: cn('border', theme.surface.card, theme.text.tertiary, 'dark:border-slate-700'),
    neutral: cn('border', theme.surface.card, theme.text.secondary, 'dark:border-slate-700')
  };

  const dotColors: Record<StatusVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: cn(theme.colors.primary),
    pending: cn(theme.text.tertiary),
    active: 'bg-emerald-500',
    inactive: cn(theme.text.tertiary),
    neutral: cn(theme.text.tertiary)
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'
  };

  const content = (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium border rounded-full whitespace-nowrap',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {showDot && (
        <span className={cn('rounded-full', dotColors[variant], dotSizes[size])} />
      )}
      {status}
    </span>
  );
  // Content rendering based on type

  if (animated) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {content}
      </motion.span>
    );
  }

  return content;
};

StatusBadge.displayName = 'StatusBadge';
export default StatusBadge;
