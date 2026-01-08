/**
 * Client Analytics Skeleton
 * Loading placeholder for the client analytics page
 */

import { ChartSkeleton, MetricsSkeleton } from '@/components/analytics/AnalyticsSkeleton';
import { Skeleton } from '@/components/ui/shadcn/skeleton';

export function ClientAnalyticsSkeleton(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Metrics */}
      <MetricsSkeleton count={6} className="xl:grid-cols-6" />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

ClientAnalyticsSkeleton.displayName = 'ClientAnalyticsSkeleton';
