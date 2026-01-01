/**
 * BillingSummaryCard Component
 * Summary card showing billing metrics and KPIs
 */

import React from 'react';
import { DollarSign, Clock, FileText, TrendingUp, TrendingDown } from 'lucide-react';

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
    <div className={`rounded-lg border ${colorClasses.border} bg-white p-6 shadow-sm dark:bg-gray-800`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-gray-100">
            {value}
          </p>

          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span
                className={`text-sm font-medium ${
                  change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`rounded-full p-3 ${colorClasses.bg}`}>
          <Icon className={`h-6 w-6 ${colorClasses.icon}`} />
        </div>
      </div>
    </div>
  );
};
