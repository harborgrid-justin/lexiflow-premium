/**
 * @module enterprise/dashboard/ExecutiveSummaryPanel
 * @category Enterprise Dashboard
 * @description Comprehensive executive summary panel with key performance indicators
 * Displays high-level metrics for executive decision-making
 */

import React, { useMemo } from 'react';
import { useTheme } from '@/theme';
import type { BaseDashboardProps, ExecutiveSummary } from '@/types/dashboard';
import { cn } from '@/shared/lib/cn';
import { motion } from 'framer-motion';

export interface ExecutiveSummaryPanelProps extends BaseDashboardProps {
  summary: ExecutiveSummary;
  period?: string;
  comparisonPeriod?: string;
}

/**
 * ExecutiveSummaryPanel - High-level executive dashboard
 * Provides a comprehensive overview of key business metrics
 */
const ExecutiveSummaryPanelComponent: React.FC<ExecutiveSummaryPanelProps> = ({
  summary,
  period = 'This Month',
  comparisonPeriod = 'vs Last Month',
  className,
  isLoading = false,
  error,
}) => {
  const { theme } = useTheme();

  const metrics = useMemo(
    () => [
      {
        id: 'revenue',
        label: 'Total Revenue',
        value: summary.totalRevenue,
        change: summary.revenueChange,
        icon: DollarSign,
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        format: 'currency' as const,
      },
      {
        id: 'cases',
        label: 'Total Cases',
        value: summary.totalCases,
        change: summary.casesChange,
        icon: Briefcase,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        format: 'number' as const,
      },
      {
        id: 'active',
        label: 'Active Cases',
        value: summary.activeCases,
        change: summary.activeCasesChange,
        icon: CheckCircle,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        format: 'number' as const,
      },
      {
        id: 'team',
        label: 'Team Size',
        value: summary.teamSize,
        change: 0,
        icon: Users,
        color: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
        format: 'number' as const,
      },
      {
        id: 'efficiency',
        label: 'Avg Efficiency',
        value: summary.averageEfficiency,
        change: summary.efficiencyChange,
        icon: TrendingUp,
        color: 'text-cyan-600 dark:text-cyan-400',
        bgColor: 'bg-cyan-100 dark:bg-cyan-900/30',
        format: 'percentage' as const,
      },
      {
        id: 'billable',
        label: 'Billable Hours',
        value: summary.billableHours,
        change: summary.billableHoursChange,
        icon: Clock,
        color: 'text-amber-600 dark:text-amber-400',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        format: 'number' as const,
      },
      {
        id: 'collection',
        label: 'Collection Rate',
        value: summary.collectionRate,
        change: summary.collectionRateChange,
        icon: Target,
        color: 'text-teal-600 dark:text-teal-400',
        bgColor: 'bg-teal-100 dark:bg-teal-900/30',
        format: 'percentage' as const,
      },
      {
        id: 'satisfaction',
        label: 'Client Satisfaction',
        value: summary.clientSatisfaction,
        change: summary.satisfactionChange,
        icon: Award,
        color: 'text-pink-600 dark:text-pink-400',
        bgColor: 'bg-pink-100 dark:bg-pink-900/30',
        format: 'percentage' as const,
      },
    ],
    [summary]
  );
console.log('metrics data:', metrics);

  const formatValue = (value: number, format: 'currency' | 'number' | 'percentage'): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'number':
      default:
        return value.toLocaleString('en-US');
    }
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (change < 0) return 'text-rose-600 dark:text-rose-400';
    return theme.text.tertiary;
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
              Failed to Load Executive Summary
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-6', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={cn('text-2xl font-bold', theme.text.primary)}>
            Executive Summary
          </h2>
          <p className={cn('text-sm mt-1 flex items-center gap-2', theme.text.tertiary)}>
            <Calendar className="h-3 w-3" />
            {period}
            <span className="text-xs">{comparisonPeriod}</span>
          </p>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'p-5 rounded-xl border shadow-sm hover:shadow-md transition-all',
                theme.surface.default,
                theme.border.default,
                isLoading && 'animate-pulse'
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn('p-2.5 rounded-lg', metric.bgColor)}>
                  <Icon className={cn('h-5 w-5', metric.color)} />
                </div>
                {metric.change !== 0 && (
                  <div className={cn('text-xs font-bold', getTrendColor(metric.change))}>
                    {getTrendIcon(metric.change)} {Math.abs(metric.change).toFixed(1)}%
                  </div>
                )}
              </div>
              <div>
                <p className={cn('text-xs font-medium mb-1.5', theme.text.secondary)}>
                  {metric.label}
                </p>
                <motion.p
                  key={metric.value}
                  initial={{ scale: 1.05 }}
                  animate={{ scale: 1 }}
                  className={cn('text-2xl font-bold', theme.text.primary)}
                >
                  {isLoading ? '---' : formatValue(metric.value, metric.format)}
                </motion.p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Critical Alerts Section */}
      {(summary.upcomingDeadlines > 0 || summary.overdueItems > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {summary.upcomingDeadlines > 0 && (
            <div
              className={cn(
                'p-4 rounded-lg border',
                'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-100">
                    {summary.upcomingDeadlines} Upcoming Deadlines
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                    Due in the next 7 days
                  </p>
                </div>
              </div>
            </div>
          )}
          {summary.overdueItems > 0 && (
            <div
              className={cn(
                'p-4 rounded-lg border',
                'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="font-bold text-rose-900 dark:text-rose-100">
                    {summary.overdueItems} Overdue Items
                  </p>
                  <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                    Require immediate attention
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export const ExecutiveSummaryPanel = React.memo(ExecutiveSummaryPanelComponent);
ExecutiveSummaryPanel.displayName = 'ExecutiveSummaryPanel';
