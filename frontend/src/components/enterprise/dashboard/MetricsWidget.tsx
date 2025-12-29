/**
 * @module enterprise/dashboard/MetricsWidget
 * @category Enterprise Dashboard
 * @description Real-time metrics widget with live updates
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon, RefreshCw, AlertCircle } from 'lucide-react';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';

export interface MetricItem {
  id: string;
  label: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  unit?: string;
  icon?: LucideIcon;
  color?: string;
}

export interface MetricsWidgetProps {
  title: string;
  metrics: MetricItem[];
  isLoading?: boolean;
  error?: string;
  onRefresh?: () => void;
  refreshInterval?: number;
  autoRefresh?: boolean;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
}

/**
 * MetricsWidget - Real-time metrics display widget
 * Shows multiple metrics in a grid with optional auto-refresh
 */
export const MetricsWidget: React.FC<MetricsWidgetProps> = ({
  title,
  metrics,
  isLoading = false,
  error,
  onRefresh,
  refreshInterval = 30000,
  autoRefresh = false,
  className,
  columns = 2,
}) => {
  const { theme } = useTheme();
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(() => {
        onRefresh();
        setLastUpdate(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, onRefresh, refreshInterval]);

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setLastUpdate(new Date());
    }
  };

  const getGridColumns = () => {
    switch (columns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2';
    }
  };

  const getChangeColor = (changeType?: 'increase' | 'decrease') => {
    if (changeType === 'increase') {
      return 'text-emerald-600 dark:text-emerald-400';
    }
    if (changeType === 'decrease') {
      return 'text-rose-600 dark:text-rose-400';
    }
    return theme.text.tertiary;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-xl border shadow-sm',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={cn('text-lg font-bold', theme.text.primary)}>{title}</h3>
          <p className={cn('text-xs mt-1', theme.text.tertiary)}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
              isLoading && 'opacity-50 cursor-not-allowed'
            )}
            aria-label="Refresh metrics"
          >
            <RefreshCw
              className={cn(
                'h-5 w-5',
                isLoading && 'animate-spin',
                theme.text.secondary
              )}
            />
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-4 mb-4 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800"
        >
          <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
        </motion.div>
      )}

      {/* Metrics Grid */}
      <div className={cn('grid gap-4', getGridColumns())}>
        <AnimatePresence mode="wait">
          {isLoading && metrics.length === 0 ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="col-span-full flex items-center justify-center py-12"
            >
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            </motion.div>
          ) : (
            metrics.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <motion.div
                  key={metric.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    'p-4 rounded-lg border',
                    'hover:border-blue-300 dark:hover:border-blue-700 transition-colors',
                    theme.surface.elevated,
                    theme.border.default
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className={cn('text-sm font-medium', theme.text.secondary)}>
                      {metric.label}
                    </p>
                    {IconComponent && (
                      <IconComponent
                        className={cn('h-4 w-4', metric.color || theme.text.tertiary)}
                      />
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <motion.p
                      key={`${metric.id}-${metric.value}`}
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      className={cn('text-2xl font-bold', theme.text.primary)}
                    >
                      {metric.value}
                      {metric.unit && (
                        <span className={cn('text-sm ml-1', theme.text.tertiary)}>
                          {metric.unit}
                        </span>
                      )}
                    </motion.p>
                  </div>
                  {metric.change !== undefined && (
                    <p
                      className={cn(
                        'text-xs mt-2 font-medium',
                        getChangeColor(metric.changeType)
                      )}
                    >
                      {metric.change > 0 ? '+' : ''}
                      {metric.change}% from last period
                    </p>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
