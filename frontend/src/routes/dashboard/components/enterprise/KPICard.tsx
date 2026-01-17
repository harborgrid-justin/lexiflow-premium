/**
 * @module enterprise/dashboard/KPICard
 * @category Enterprise Dashboard
 * @description Animated KPI card component with counter animation
 */

import { motion } from 'framer-motion';
import { type LucideIcon, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

export interface KPICardProps {
  title: string;
  value: number;
  previousValue?: number;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  format?: 'number' | 'currency' | 'percentage';
  animationDuration?: number;
  className?: string;
  iconColor?: string;
  iconBgColor?: string;
}

/**
 * KPICard - Enterprise KPI card with animated counter
 * Displays key metrics with trend indicators and smooth animations
 */
const KPICardComponent: React.FC<KPICardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  icon: Icon,
  trend,
  trendValue,
  format = 'number',
  animationDuration = 1000,
  className,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-100 dark:bg-blue-900/30',
}) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter effect
  useEffect(() => {
    const startTime = performance.now();
    const startValue = displayValue;
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
  }, [value, animationDuration, displayValue]);

  const formatValue = (val: number): string => {
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
    if (trend === 'up') {
      return <TrendingUp className="h-4 w-4" />;
    }
    if (trend === 'down') {
      return <TrendingDown className="h-4 w-4" />;
    }
    return null;
  };

  const getTrendColor = () => {
    if (trend === 'up') {
      return 'text-emerald-600 dark:text-emerald-400';
    }
    if (trend === 'down') {
      return 'text-rose-600 dark:text-rose-400';
    }
    return theme.text.tertiary;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium mb-2', theme.text.secondary)}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <motion.h3
              key={value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={cn('text-3xl font-bold', theme.text.primary)}
            >
              {prefix}
              {formatValue(displayValue)}
              {suffix}
            </motion.h3>
          </div>
          {(trend || trendValue) && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm', getTrendColor())}>
              {getTrendIcon()}
              {trendValue && <span className="font-medium">{trendValue}</span>}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg', iconBgColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const KPICard = React.memo(KPICardComponent);
KPICard.displayName = 'KPICard';
export default KPICard;
