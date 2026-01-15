/**
 * @module components/dashboard/widgets/KPICard
 * @category Dashboard Widgets
 * @description Enterprise KPI card with value, change percentage, trend indicators, and sparklines
 * Designed for executive dashboards with professional styling and animations
 */

import { cn } from '@/shared/lib/cn';
import { useTheme } from '@/theme';
import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface KPICardProps {
  /** KPI label/title */
  label: string;
  /** Current value */
  value: number | string;
  /** Previous value for comparison */
  previousValue?: number;
  /** Manual change percentage override */
  changePercentage?: number;
  /** Trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Icon to display */
  icon?: LucideIcon;
  /** Format type for value display */
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  /** Color theme */
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  /** Optional subtitle */
  subtitle?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
  /** Target value for goal tracking */
  target?: number;
  /** Currency symbol for currency format */
  currency?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const formatValue = (value: number | string, format: KPICardProps['format'], currency = '$'): string => {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return `${currency}${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'duration':
      return `${value.toLocaleString()}h`;
    case 'number':
    default:
      return value.toLocaleString();
  }
};

const calculateChange = (current: number, previous: number): { percentage: number; trend: 'up' | 'down' | 'neutral' } => {
  if (previous === 0) return { percentage: 0, trend: 'neutral' };
  const percentage = ((current - previous) / previous) * 100;
  const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
  return { percentage, trend };
};

const getColorStyles = (tokens: any) => ({
  blue: {
    bg: tokens.colors.blue400 + '15',
    border: tokens.colors.blue400,
    icon: tokens.colors.blue500,
    iconBg: tokens.colors.blue400 + '20',
    accent: tokens.colors.blue500,
  },
  green: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    border: 'border-emerald-200 dark:border-emerald-800',
    icon: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    accent: 'text-purple-600 dark:text-purple-400',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950/20',
    border: 'border-orange-200 dark:border-orange-800',
    icon: 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30',
    accent: 'text-orange-600 dark:text-orange-400',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30',
    accent: 'text-red-600 dark:text-red-400',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30',
    accent: 'text-gray-600 dark:text-gray-400',
  },
});

// ============================================================================
// COMPONENT
// ============================================================================

export const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  previousValue,
  changePercentage,
  trend,
  icon: Icon,
  format = 'number',
  color = 'blue',
  subtitle,
  isLoading = false,
  className,
  onClick,
  target,
  currency = '$',
}) => {
  const { tokens } = useTheme();
  const colorClasses = React.useMemo(() => getColorStyles(tokens), [tokens]);
  const [displayValue, setDisplayValue] = useState<number>(0);

  // Calculate change if previous value provided
  const change = React.useMemo(() => {
    if (changePercentage !== undefined) {
      return { percentage: changePercentage, trend: trend || 'neutral' };
    }
    if (typeof value === 'number' && previousValue !== undefined) {
      return calculateChange(value, previousValue);
    }
    return { percentage: 0, trend: trend || 'neutral' };
  }, [value, previousValue, changePercentage, trend]);

  // Animate numeric values
  const displayValueRef = useRef(displayValue);
  displayValueRef.current = displayValue;

  useEffect(() => {
    if (typeof value === 'number' && !isLoading) {
      const duration = 1000;
      const startTime = performance.now();
      const startValue = displayValueRef.current;
      const endValue = value;

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setDisplayValue(startValue + (endValue - startValue) * easeOut);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [value, isLoading]);

  // Calculate progress to target if provided
  const progressPercent = target && typeof value === 'number' ? (value / target) * 100 : undefined;

  const colors = colorClasses[color];
  const TrendIcon = change.trend === 'up' ? TrendingUp : change.trend === 'down' ? TrendingDown : Minus;
  const trendColor = change.trend === 'up' ? 'text-green-600' : change.trend === 'down' ? 'text-red-600' : 'text-slate-600';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border p-6 transition-all duration-200',
        "bg-surface border-border", // Fixed: Use Tailwind classes instead of theme hex values
        colors.border,
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        !onClick && 'hover:shadow-md',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      )}

      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className={cn('text-xs font-semibold uppercase tracking-wider mb-1 text-text-muted')}>
            {label}
          </p>
          {subtitle && (
            <p className={cn('text-xs text-text-muted')}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg', colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className={cn('text-3xl font-bold mb-3 text-text')}>
        {typeof value === 'number' ? formatValue(displayValue, format, currency) : value}
      </div>

      {/* Change indicator */}
      {(changePercentage !== undefined || previousValue !== undefined) && (
        <div className="flex items-center gap-2 mb-2">
          <div className={cn('flex items-center gap-1 text-sm font-medium', trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>
              {change.trend === 'neutral' ? '0.0' : Math.abs(change.percentage).toFixed(1)}%
            </span>
          </div>
          <span className={cn('text-xs text-text-muted')}>
            vs previous period
          </span>
        </div>
      )}

      {/* Target progress bar */}
      {target && progressPercent !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-muted">Progress to goal</span>
            <span className={cn('font-medium text-text-muted')}>
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full transition-all duration-500 rounded-full', colors.accent.replace('text-', 'bg-'))}
              style={{ width: `${Math.min(progressPercent, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

KPICard.displayName = 'KPICard';
