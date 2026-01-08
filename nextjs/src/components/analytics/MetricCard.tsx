'use client';

/**
 * MetricCard Component
 * Displays a single metric with trend indicator and formatting
 *
 * @component
 */

import { cn } from '@/lib/utils';
import type { MetricCardData, MetricColor, MetricFormat, TrendDirection } from '@/types/analytics-module';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import * as React from 'react';

interface MetricCardProps {
  data: MetricCardData;
  className?: string;
  onClick?: () => void;
}

/**
 * Format value based on format type
 */
function formatValue(value: number, format: MetricFormat, unit?: string): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      return `${value} ${unit || 'days'}`;
    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value) + (unit ? ` ${unit}` : '');
  }
}

/**
 * Get trend icon component
 */
function getTrendIcon(direction: TrendDirection): React.ReactNode {
  switch (direction) {
    case 'up':
      return <ArrowUp className="h-3 w-3" />;
    case 'down':
      return <ArrowDown className="h-3 w-3" />;
    case 'neutral':
    default:
      return <ArrowRight className="h-3 w-3" />;
  }
}

/**
 * Get color classes for metric card
 */
function getColorClasses(color: MetricColor = 'blue'): {
  bg: string;
  text: string;
  icon: string;
} {
  const colors: Record<MetricColor, { bg: string; text: string; icon: string }> = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'bg-blue-100 dark:bg-blue-900/40',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-600 dark:text-green-400',
      icon: 'bg-green-100 dark:bg-green-900/40',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: 'bg-yellow-100 dark:bg-yellow-900/40',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'bg-purple-100 dark:bg-purple-900/40',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-600 dark:text-red-400',
      icon: 'bg-red-100 dark:bg-red-900/40',
    },
    gray: {
      bg: 'bg-slate-50 dark:bg-slate-900/20',
      text: 'text-slate-600 dark:text-slate-400',
      icon: 'bg-slate-100 dark:bg-slate-900/40',
    },
  };
  return colors[color];
}

/**
 * Get trend color classes
 */
function getTrendColorClasses(direction: TrendDirection): string {
  switch (direction) {
    case 'up':
      return 'text-green-600 dark:text-green-400';
    case 'down':
      return 'text-red-600 dark:text-red-400';
    case 'neutral':
    default:
      return 'text-slate-500 dark:text-slate-400';
  }
}

export function MetricCard({ data, className, onClick }: MetricCardProps): React.JSX.Element {
  const { label, value, format, trend, icon, color, unit, description } = data;
  const colorClasses = getColorClasses(color);

  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all dark:border-slate-700 dark:bg-slate-800',
        onClick && 'cursor-pointer hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
            {formatValue(value, format, unit)}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 truncate">
              {description}
            </p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-xs font-medium',
                  getTrendColorClasses(trend.direction)
                )}
              >
                {getTrendIcon(trend.direction)}
                {Math.abs(trend.value).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {trend.period}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg text-lg',
              colorClasses.icon
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

MetricCard.displayName = 'MetricCard';
