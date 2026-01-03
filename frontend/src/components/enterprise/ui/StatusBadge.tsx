/**
 * @module enterprise/ui/StatusBadge
 * @category Enterprise UI
 * @description Enhanced status badge with animations and variants
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { motion } from 'framer-motion';
import React from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

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
  className}) => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const variants: Record<StatusVariant, string> = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    warning: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
    error: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
    info: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    pending: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    active: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'};

  const dotColors: Record<StatusVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
    pending: 'bg-slate-400',
    active: 'bg-emerald-500',
    inactive: 'bg-slate-400',
    neutral: 'bg-slate-400'};

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'};

  const dotSizes = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2 w-2',
    lg: 'h-2.5 w-2.5'};

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
  console.log('content data:', content);

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
