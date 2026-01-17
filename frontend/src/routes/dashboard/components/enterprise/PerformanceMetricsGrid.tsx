/**
 * @module enterprise/dashboard/PerformanceMetricsGrid
 * @category Enterprise Dashboard
 * @description Performance metrics grid with detailed analytics and comparisons
 * Displays comprehensive performance metrics with benchmarks and trends
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Filter,
  type LucideIcon,
  Minus,
  Target,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import type { BaseDashboardProps, PerformanceMetric } from '@/types/dashboard';

export interface PerformanceMetricsGridProps extends BaseDashboardProps {
  metrics: PerformanceMetric[];
  showBenchmarks?: boolean;
  showTargets?: boolean;
  showTrends?: boolean;
  groupBy?: 'category' | 'status' | 'none';
  sortBy?: 'name' | 'value' | 'trend' | 'status';
  sortOrder?: 'asc' | 'desc';
}

type MetricStatus = 'excellent' | 'good' | 'fair' | 'poor';

const STATUS_CONFIG: Record<
  MetricStatus,
  { color: string; bgColor: string; icon: LucideIcon; label: string }
> = {
  excellent: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    icon: Award,
    label: 'Excellent'
  },
  good: {
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    icon: TrendingUp,
    label: 'Good'
  },
  fair: {
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    icon: Minus,
    label: 'Fair'
  },
  poor: {
    color: 'text-rose-600 dark:text-rose-400',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    icon: TrendingDown,
    label: 'Poor'
  }
};

/**
 * PerformanceMetricsGrid - Comprehensive performance metrics display
 * Shows detailed metrics with comparisons, trends, and status indicators
 */
export const PerformanceMetricsGrid: React.FC<PerformanceMetricsGridProps> = ({
  metrics,
  showBenchmarks = true,
  showTargets = true,
  showTrends = true,
  groupBy = 'none',
  sortBy = 'name',
  sortOrder = 'asc',
  className,
  isLoading = false,
  error }) => {
  const { theme } = useTheme();
  const [filterStatus, setFilterStatus] = useState<MetricStatus | 'all'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const sortedMetrics = useMemo(() => {
    let sorted = [...metrics];

    // Filter by status
    if (filterStatus !== 'all') {
      sorted = sorted.filter((metric) => metric.status === filterStatus);
    }

    // Sort
    sorted.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'value':
          compareValue = a.value - b.value;
          break;
        case 'trend':
          compareValue = a.trend.change - b.trend.change;
          break;
        case 'status': {
          const statusOrder = { excellent: 0, good: 1, fair: 2, poor: 3 };
          compareValue = statusOrder[a.status] - statusOrder[b.status];
          break;
        }
        case 'name':
        default:
          compareValue = a.name.localeCompare(b.name);
          break;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return sorted;
  }, [metrics, filterStatus, sortBy, sortOrder]);

  const groupedMetrics = useMemo(() => {
    if (groupBy === 'none') {
      return { All: sortedMetrics };
    }

    return sortedMetrics.reduce((acc, metric) => {
      const key = groupBy === 'category' ? metric.category : metric.status;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(metric);
      return acc;
    }, {} as Record<string, PerformanceMetric[]>);
  }, [sortedMetrics, groupBy]);

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (trend < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 5) return 'text-emerald-600 dark:text-emerald-400';
    if (trend > 0) return 'text-blue-600 dark:text-blue-400';
    if (trend < -5) return 'text-rose-600 dark:text-rose-400';
    if (trend < 0) return 'text-amber-600 dark:text-amber-400';
    return theme.text.tertiary;
  };

  const getProgressWidth = (value: number, target?: number) => {
    if (!target) return 100;
    return Math.min((value / target) * 100, 100);
  };

  const renderMetric = (metric: PerformanceMetric, index: number) => {
    const statusConfig = STATUS_CONFIG[metric.status];
    const StatusIcon = statusConfig.icon;
    const progressWidth = getProgressWidth(metric.value, metric.target);

    return (
      <motion.div
        key={metric.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={cn(
          'p-5 rounded-xl border shadow-sm hover:shadow-md transition-all',
          theme.surface.default,
          theme.border.default
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className={cn('text-sm font-medium', theme.text.secondary)}>
                {metric.category}
              </p>
              <div className={cn('px-2 py-0.5 rounded text-xs font-bold', statusConfig.bgColor, statusConfig.color)}>
                {statusConfig.label}
              </div>
            </div>
            <h4 className={cn('text-base font-bold', theme.text.primary)}>
              {metric.name}
            </h4>
          </div>
          <div className={cn('p-2 rounded-lg', statusConfig.bgColor)}>
            <StatusIcon className={cn('h-5 w-5', statusConfig.color)} />
          </div>
        </div>

        {/* Value Display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-2">
            <motion.span
              key={metric.value}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className={cn('text-3xl font-bold', theme.text.primary)}
            >
              {metric.value.toLocaleString()}
              <span className={cn('text-sm ml-1', theme.text.tertiary)}>{metric.unit}</span>
            </motion.span>
          </div>

          {/* Progress Bar */}
          {showTargets && metric.target && (
            <div className="mb-2">
              <div style={{ backgroundColor: 'var(--color-border)' }} className="relative h-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressWidth}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={cn(
                    'h-full rounded-full',
                    metric.status === 'excellent' && 'bg-emerald-500',
                    metric.status === 'good' && 'bg-blue-500',
                    metric.status === 'fair' && 'bg-amber-500',
                    metric.status === 'poor' && 'bg-rose-500'
                  )}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={cn('text-xs', theme.text.tertiary)}>
                  Target: {metric.target.toLocaleString()} {metric.unit}
                </span>
                <span className={cn('text-xs font-medium', statusConfig.color)}>
                  {progressWidth.toFixed(0)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200 dark:border-slate-700">
          {showTrends && (
            <div>
              <p className={cn('text-xs mb-1', theme.text.tertiary)}>Trend</p>
              <div className={cn('flex items-center gap-1 text-sm font-bold', getTrendColor(metric.trend.change))}>
                {getTrendIcon(metric.trend.change)}
                {Math.abs(metric.trend.changePercentage).toFixed(1)}%
              </div>
            </div>
          )}
          {showBenchmarks && metric.benchmark && (
            <div>
              <p className={cn('text-xs mb-1', theme.text.tertiary)}>Benchmark</p>
              <p className={cn('text-sm font-bold', theme.text.primary)}>
                {metric.benchmark.toLocaleString()}
              </p>
            </div>
          )}
          {metric.target && (
            <div>
              <p className={cn('text-xs mb-1', theme.text.tertiary)}>Gap</p>
              <p className={cn('text-sm font-bold', theme.text.primary)}>
                {(metric.target - metric.value).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Description */}
        {metric.description && (
          <p className={cn('text-xs mt-3 pt-3 border-t border-gray-200 dark:border-slate-700', theme.text.tertiary)}>
            {metric.description}
          </p>
        )}
      </motion.div>
    );
  };

  if (error?.hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'p-6 rounded-xl border',
          'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          <div>
            <h3 className="font-bold text-rose-900 dark:text-rose-100">
              Failed to Load Performance Metrics
            </h3>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Filters */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={cn('text-2xl font-bold', theme.text.primary)}>
            Performance Metrics
          </h2>
          <p className={cn('text-sm mt-1', theme.text.tertiary)}>
            Detailed performance analysis and benchmarking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className={cn('h-4 w-4', theme.text.tertiary)} />
          {(['all', 'excellent', 'good', 'fair', 'poor'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Activity className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : Object.keys(groupedMetrics).length === 0 ? (
        <div className="text-center py-12">
          <BarChart3 className={cn('h-12 w-12 mx-auto mb-3', theme.text.tertiary)} />
          <p className={cn('text-sm font-medium', theme.text.secondary)}>
            No metrics to display
          </p>
          <p className={cn('text-xs mt-1', theme.text.tertiary)}>
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
            <div key={category}>
              {groupBy !== 'none' && (
                <button
                  onClick={() => toggleCategory(category)}
                  className={cn(
                    'flex items-center gap-2 mb-4 text-lg font-bold hover:text-blue-600 transition-colors',
                    theme.text.primary
                  )}
                >
                  <Target className="h-5 w-5" />
                  {category}
                  <span className={cn('text-sm font-normal', theme.text.tertiary)}>
                    ({categoryMetrics.length})
                  </span>
                </button>
              )}
              <AnimatePresence>
                {(groupBy === 'none' || expandedCategories.has(category)) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {categoryMetrics.map((metric, index) => renderMetric(metric, index))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
