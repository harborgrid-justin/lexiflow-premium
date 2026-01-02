'use client';

/**
 * Badge Component - Small label to display status or categories
 */

import { ReactNode } from 'react';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-50',
  primary:
    'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300',
  success:
    'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300',
  warning:
    'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300',
  danger: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300',
  info: 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs font-semibold rounded-full',
  md: 'px-3 py-1 text-sm font-semibold rounded-full',
  lg: 'px-4 py-1.5 text-base font-semibold rounded-full',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      {children}
    </span>
  );
}
