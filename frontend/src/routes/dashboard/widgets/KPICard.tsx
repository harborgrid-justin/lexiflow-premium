/**
 * @module components/dashboard/widgets/KPICard
 * @category Dashboard Widgets
 * @description Enterprise KPI card with value, change percentage, trend indicators, and sparklines
 * Designed for executive dashboards with professional styling and animations
 */
import { cn } from '@/lib/cn';
import { useTheme } from '@/theme';
import type { DesignTokens } from '@/theme/tokens';
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

const getColorConfig = (color: KPICardProps['color'], tokens: DesignTokens) => {
  switch (color) {
    case 'blue':
      return {
        bgColor: `${tokens.colors.info}10`,
        borderColor: `${tokens.colors.info}40`,
        iconBg: `${tokens.colors.info}20`,
        iconColor: tokens.colors.info,
        accentColor: tokens.colors.info,
      };
    case 'green':
      return {
        bgColor: `${tokens.colors.success}10`,
        borderColor: `${tokens.colors.success}40`,
        iconBg: `${tokens.colors.success}20`,
        iconColor: tokens.colors.success,
        accentColor: tokens.colors.success,
      };
    case 'purple':
      return {
        bgColor: '#9333ea10',
        borderColor: '#9333ea40',
        iconBg: '#9333ea20',
        iconColor: '#9333ea',
        accentColor: '#9333ea',
      };
    case 'orange':
      return {
        bgColor: '#f97316 10',
        borderColor: '#f9731640',
        iconBg: '#f9731620',
        iconColor: '#f97316',
        accentColor: '#f97316',
      };
    case 'red':
      return {
        bgColor: `${tokens.colors.error}10`,
        borderColor: `${tokens.colors.error}40`,
        iconBg: `${tokens.colors.error}20`,
        iconColor: tokens.colors.error,
        accentColor: tokens.colors.error,
      };
    case 'gray':
    default:
      return {
        bgColor: tokens.colors.surfaceHover,
        borderColor: tokens.colors.border,
        iconBg: tokens.colors.surfaceHover,
        iconColor: tokens.colors.textMuted,
        accentColor: tokens.colors.textMuted,
      };
  }
};
// ============================================================================
// COMPONENT
// ============================================================================
export function KPICard({
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
}: KPICardProps) {
  const { tokens } = useTheme();
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
  const colors = getColorConfig(color, tokens);
  const TrendIcon = change.trend === 'up' ? TrendingUp : change.trend === 'down' ? TrendingDown : Minus;
  const trendColor = change.trend === 'up' ? tokens.colors.success :
    change.trend === 'down' ? tokens.colors.error :
      tokens.colors.textMuted;
  return (
    <div
      style={{
        backgroundColor: tokens.colors.surface,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: tokens.borderRadius.xl,
        boxShadow: onClick ? tokens.shadows.md : tokens.shadows.sm
      }}
      className={cn(
        'relative overflow-hidden p-6 transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div
          style={{ backgroundColor: tokens.colors.surface }}
          className="absolute inset-0 backdrop-blur-sm flex items-center justify-center z-10 opacity-50"
        >
          <div
            style={{
              borderColor: `${tokens.colors.border} ${tokens.colors.border} ${tokens.colors.info} ${tokens.colors.border}`,
              borderRadius: '50%'
            }}
            className="h-6 w-6 animate-spin border-2"
          />
        </div>
      )}
      {/* Header with icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p
            style={{ color: tokens.colors.textSecondary }}
            className="text-xs font-semibold uppercase tracking-wider mb-1"
          >
            {label}
          </p>
          {subtitle && (
            <p style={{ color: tokens.colors.textMuted }} className="text-xs">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div
            style={{
              backgroundColor: colors.iconBg,
              color: colors.iconColor,
              borderRadius: tokens.borderRadius.lg
            }}
            className="p-3"
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {/* Value */}
      <div style={{ color: tokens.colors.text }} className="text-3xl font-bold mb-3">
        {typeof value === 'number' ? formatValue(displayValue, format, currency) : value}
      </div>
      {/* Change indicator */}
      {(changePercentage !== undefined || previousValue !== undefined) && (
        <div className="flex items-center gap-2 mb-2">
          <div style={{ color: trendColor }} className="flex items-center gap-1 text-sm font-medium">
            <TrendIcon className="h-4 w-4" />
            <span>
              {change.trend === 'neutral' ? '0.0' : Math.abs(change.percentage).toFixed(1)}%
            </span>
          </div>
          <span style={{ color: tokens.colors.textMuted }} className="text-xs">
            vs previous period
          </span>
        </div>
      )}
      {/* Target progress bar */}
      {target && progressPercent !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span style={{ color: tokens.colors.textMuted }}>Progress to goal</span>
            <span style={{ color: tokens.colors.textSecondary }} className="font-medium">
              {progressPercent.toFixed(0)}%
            </span>
          </div>
          <div
            style={{
              backgroundColor: tokens.colors.border,
              borderRadius: tokens.borderRadius.full
            }}
            className="h-2 overflow-hidden"
          >
            <div
              style={{
                backgroundColor: colors.accentColor,
                borderRadius: tokens.borderRadius.full,
                width: `${Math.min(progressPercent, 100)}%`
              }}
              className="h-full transition-all duration-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
KPICard.displayName = 'KPICard';
