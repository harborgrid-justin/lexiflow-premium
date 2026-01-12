/**
 * @module enterprise/ui/MetricCard
 * @category Enterprise UI
 * @description Metric card component for displaying KPIs and statistics
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { motion } from 'framer-motion';
import { LucideIcon, Minus, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MetricCardProps {
  label: string;
  value: number | string;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percentage';
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  prefix?: string;
  suffix?: string;
  description?: string;
  animateValue?: boolean;
  animationDuration?: number;
  className?: string;
  iconColor?: string;
  iconBgColor?: string;
  onClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  previousValue,
  format = 'number',
  icon: Icon,
  trend,
  trendValue,
  prefix = '',
  suffix = '',
  description,
  animateValue = true,
  animationDuration = 1000,
  className,
  iconColor = 'text-blue-600 dark:text-blue-400',
  iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
  onClick,
}) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);
  const displayValueRef = useRef(displayValue);

  useEffect(() => {
    displayValueRef.current = displayValue;
  }, [displayValue]);

  // Animated counter effect
  useEffect(() => {
    if (!animateValue || typeof value !== 'number') {
      setDisplayValue(typeof value === 'number' ? value : 0);
      return;
    }

    const startTime = performance.now();
    const startValue = displayValueRef.current;
    const endValue = value;
    const duration = animationDuration;

    const animate = () => {
      const now = performance.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = startValue + (endValue - startValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, animateValue, animationDuration]);

  const formatValue = (val: number | string): string => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return val.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      case 'percentage':
        return val.toFixed(1);
      case 'number':
      default:
        return val.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 dark:text-emerald-400';
    if (trend === 'down') return 'text-rose-600 dark:text-rose-400';
    return theme.text.tertiary;
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'p-6 rounded-xl border transition-all',
        theme.surface.default,
        theme.border.default,
        onClick && 'cursor-pointer hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700',
        !onClick && 'hover:shadow-md',
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className={cn('text-sm font-medium mb-1', theme.text.secondary)}>
            {label}
          </p>
          {description && (
            <p className={cn('text-xs', theme.text.tertiary)}>
              {description}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <motion.h3
          key={typeof value === 'number' ? value : value.toString()}
          initial={animateValue ? { scale: 1.1 } : {}}
          animate={{ scale: 1 }}
          className={cn('text-3xl font-bold', theme.text.primary)}
        >
          {prefix}
          {typeof value === 'number' ? formatValue(displayValue) : value}
          {suffix}
        </motion.h3>
      </div>

      {(trend || trendValue) && (
        <div className={cn('flex items-center gap-1.5 text-sm', getTrendColor())}>
          <TrendIcon className="h-4 w-4" />
          {trendValue && <span className="font-medium">{trendValue}</span>}
          {previousValue && typeof value === 'number' && (
            <span className={cn('text-xs', theme.text.tertiary)}>
              vs previous period
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

MetricCard.displayName = 'MetricCard';
export default MetricCard;
