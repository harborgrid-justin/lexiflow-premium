/**
 * MetricCard Component
 * Displays a single metric with optional trend indicator
 */

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MetricCardData } from '@/types/analytics-enterprise';

export interface MetricCardProps {
  data: MetricCardData;
  className?: string;
  loading?: boolean;
}

export function MetricCard({ data, className = '', loading = false }: MetricCardProps) {
  const formatValue = (value: number | string): string => {
    if (typeof value === 'string') return value;

    switch (data.format) {
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        return `${value} days`;
      case 'number':
      default:
        return value.toLocaleString();
    }
  };

  const getTrendColor = () => {
    if (!data.trend) return 'text-gray-400';
    switch (data.trend.direction) {
      case 'up':
        return data.color === 'red' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
      case 'down':
        return data.color === 'red' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    if (!data.trend) return null;
    switch (data.trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getColorClasses = () => {
    const colors = {
      blue: 'border-blue-200 dark:border-blue-800',
      green: 'border-green-200 dark:border-green-800',
      red: 'border-red-200 dark:border-red-800',
      yellow: 'border-yellow-200 dark:border-yellow-800',
      purple: 'border-purple-200 dark:border-purple-800',
      gray: 'border-gray-200 dark:border-gray-700',
    };
    return colors[data.color || 'gray'];
  };

  if (loading) {
    return (
      <div className={`rounded-lg border bg-white p-6 dark:bg-gray-800 ${className}`}>
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-8 w-32 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border bg-white p-6 transition-shadow hover:shadow-md dark:bg-gray-800 ${getColorClasses()} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {data.label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {formatValue(data.value)}
            {data.unit && <span className="ml-1 text-lg text-gray-500">{data.unit}</span>}
          </p>
          {data.trend && (
            <div className={`mt-2 flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>
                {data.trend.value > 0 ? '+' : ''}
                {data.trend.value.toFixed(1)}%
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                vs {data.trend.period}
              </span>
            </div>
          )}
        </div>
        {data.icon && (
          <div className={`rounded-lg p-3 ${
            data.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
            data.color === 'green' ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' :
            data.color === 'red' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
            data.color === 'yellow' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' :
            data.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' :
            'bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            <span className="text-2xl">{data.icon}</span>
          </div>
        )}
      </div>
    </div>
  );
}
