'use client';

/**
 * Analytics Skeleton Components
 * Loading skeletons for analytics pages
 *
 * @component
 */

import { Skeleton } from '@/components/ui/shadcn/skeleton';
import { cn } from '@/lib/utils';
import * as React from 'react';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton for metric cards
 */
export function MetricCardSkeleton({ className }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Skeleton for chart cards
 */
export function ChartSkeleton({ className }: SkeletonProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      {/* Chart area */}
      <div className="p-4">
        <div className="flex h-[300px] items-end justify-around gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton
              key={i}
              className="w-full"
              style={{ height: `${Math.random() * 60 + 40}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Grid of metric card skeletons
 */
export function MetricsSkeleton({
  count = 4,
  className,
}: SkeletonProps & { count?: number }): React.JSX.Element {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {[...Array(count)].map((_, i) => (
        <MetricCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Full analytics page skeleton
 */
export function AnalyticsSkeleton({ className }: SkeletonProps): React.JSX.Element {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-[180px]" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Metrics skeleton */}
      <MetricsSkeleton count={4} />

      {/* Charts skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

AnalyticsSkeleton.displayName = 'AnalyticsSkeleton';
MetricCardSkeleton.displayName = 'MetricCardSkeleton';
ChartSkeleton.displayName = 'ChartSkeleton';
MetricsSkeleton.displayName = 'MetricsSkeleton';
