/**
 * @module enterprise/dashboard/DashboardSkeletonLoader
 * @category Enterprise Dashboard
 * @description Skeleton loader components for dashboard loading states
 * Provides smooth loading animations for various dashboard components
 */

import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { motion } from 'framer-motion';
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animated?: boolean;
}

/**
 * Skeleton - Base skeleton component
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animated = true,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rounded':
        return 'rounded-lg';
      case 'rectangular':
      default:
        return 'rounded';
    }
  };

  return (
    <div
      className={cn(
        'bg-gray-200 dark:bg-slate-700',
        getVariantClasses(),
        animated && 'animate-pulse',
        className
      )}
      style={{
        width: width || '100%',
        height: height || (variant === 'text' ? '1rem' : '100%'),
      }}
    />
  );
};

/**
 * KPICardSkeleton - Loading skeleton for KPI cards
 */
export const KPICardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'p-6 rounded-xl border shadow-sm',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton width="60%" height={16} className="mb-2" />
          <Skeleton width="80%" height={32} className="mb-2" />
          <Skeleton width="40%" height={14} />
        </div>
        <Skeleton variant="rounded" width={48} height={48} />
      </div>
    </div>
  );
};

/**
 * MetricsGridSkeleton - Loading skeleton for metrics grid
 */
export const MetricsGridSkeleton: React.FC<{
  columns?: number;
  rows?: number;
  className?: string;
}> = ({ columns = 4, rows = 2, className }) => {
  return (
    <div className={cn('grid gap-4', className)}>
      {/* IDENTITY-STABLE KEYS: Use stable identifiers */}
      {Array.from({ length: rows * columns }).map((_, index) => (
        <KPICardSkeleton key={`kpi-${index}`} />
      ))}
    </div>
  );
};

/**
 * ChartSkeleton - Loading skeleton for chart widgets
 */
export const ChartSkeleton: React.FC<{
  height?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ height = 300, showHeader = true, className }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'p-6 rounded-xl border shadow-sm',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {showHeader && (
        <div className="mb-6">
          <Skeleton width="30%" height={24} className="mb-2" />
          <Skeleton width="50%" height={14} />
        </div>
      )}
      <div className="relative" style={{ height }}>
        <Skeleton height="100%" variant="rounded" />
        {/* Simulate chart bars/lines */}
        <div className="absolute inset-0 flex items-end justify-around p-4 gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              width="100%"
              height={`${30 + Math.random() * 70}%`}
              variant="rounded"
              className="opacity-50"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * ActivityFeedSkeleton - Loading skeleton for activity feed
 */
export const ActivityFeedSkeleton: React.FC<{
  items?: number;
  className?: string;
}> = ({ items = 5, className }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'rounded-xl border shadow-sm',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between">
          <Skeleton width="40%" height={24} />
          <div className="flex gap-2">
            <Skeleton width={100} height={32} variant="rounded" />
            <Skeleton width={32} height={32} variant="rounded" />
          </div>
        </div>
      </div>

      {/* Activity Items - IDENTITY-STABLE KEYS */}
      <div className="p-6 space-y-3">
        {Array.from({ length: items }).map((_, index) => (
          <div
            key={`activity-${index}`}
            className="p-4 rounded-lg border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-start gap-3">
              <Skeleton variant="rounded" width={40} height={40} />
              <div className="flex-1">
                <Skeleton width="70%" height={16} className="mb-2" />
                <Skeleton width="90%" height={14} className="mb-2" />
                <Skeleton width="30%" height={12} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * TableSkeleton - Loading skeleton for data tables
 */
export const TableSkeleton: React.FC<{
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}> = ({ rows = 5, columns = 5, showHeader = true, className }) => {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {showHeader && (
        <div className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
          <div className="grid gap-4 p-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {/* IDENTITY-STABLE KEYS */}
            {Array.from({ length: columns }).map((_, index) => (
              <Skeleton key={`header-${index}`} width="80%" height={16} />
            ))}
          </div>
        </div>
      )}
      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {/* IDENTITY-STABLE KEYS */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4 p-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} width="90%" height={14} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * DashboardSkeleton - Complete dashboard skeleton loader
 */
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton width={250} height={32} className="mb-2" />
          <Skeleton width={180} height={16} />
        </div>
        <Skeleton width={120} height={36} variant="rounded" />
      </div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <KPICardSkeleton key={index} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton height={350} />
        <ChartSkeleton height={350} />
      </div>

      {/* Activity Feed */}
      <ActivityFeedSkeleton items={6} />
    </div>
  );
};

/**
 * WidgetSkeleton - Generic widget skeleton with customization
 */
export const WidgetSkeleton: React.FC<{
  height?: number;
  showHeader?: boolean;
  headerLines?: number;
  bodyLines?: number;
  className?: string;
}> = ({
  height = 300,
  showHeader = true,
  headerLines = 2,
  bodyLines = 5,
  className,
}) => {
    const { theme } = useTheme();

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'p-6 rounded-xl border shadow-sm',
          theme.surface.default,
          theme.border.default,
          className
        )}
        style={{ minHeight: height }}
      >
        {showHeader && (
          <div className="mb-6 space-y-2">
            {Array.from({ length: headerLines }).map((_, index) => (
              <Skeleton
                key={index}
                width={index === 0 ? '40%' : '60%'}
                height={index === 0 ? 20 : 14}
              />
            ))}
          </div>
        )}
        <div className="space-y-3">
          {Array.from({ length: bodyLines }).map((_, index) => (
            <Skeleton key={index} width={`${90 - index * 5}%`} height={16} />
          ))}
        </div>
      </motion.div>
    );
  };
