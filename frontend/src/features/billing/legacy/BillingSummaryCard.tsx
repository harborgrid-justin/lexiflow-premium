/**
 * BillingSummaryCard Component
 * Summary card showing billing metrics and KPIs
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/cn';
import { Clock, DollarSign, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

interface BillingSummaryCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: 'dollar' | 'clock' | 'invoice' | 'trending';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon = 'dollar',
  color = 'blue',
}) => {
  const { theme } = useTheme();
  const icons = {
    dollar: DollarSign,
    clock: Clock,
    invoice: FileText,
    trending: TrendingUp,
  };

  const colors = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-700',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      icon: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-700',
    },
    yellow: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      icon: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-700',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      icon: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-700',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      icon: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-700',
    },
  };

  const Icon = icons[icon];
  const colorClasses = colors[color];

  return (
    <div className={cn("rounded-lg border p-6 shadow-sm", colorClasses.border, theme.surface.default)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className={cn("text-sm font-medium", theme.text.secondary)}>
            {title}
          </p>
          <p className={cn("mt-2 text-3xl font-semibold", theme.text.primary)}>
            {value}
          </p>

          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className={cn("h-4 w-4", theme.text.success)} />
              ) : (
                <TrendingDown className={cn("h-4 w-4", theme.text.error)} />
              )}
              <span
                className={cn("text-sm font-medium", change >= 0 ? theme.text.success : theme.text.error)}
              >
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className={cn("text-sm", theme.text.muted)}>
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={cn("rounded-full p-3", colorClasses.bg)}>
          <Icon className={cn("h-6 w-6", colorClasses.icon)} />
        </div>
      </div>
    </div>
  );
};
