/**
 * Discovery Detail Loading State
 */

import { Card, CardBody, SkeletonLine } from '@/components/ui';

export default function DiscoveryDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Info Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardBody className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="h-10 w-full max-w-md bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardBody>
              <SkeletonLine lines={8} className="h-6" />
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardBody>
              <SkeletonLine lines={5} className="h-6" />
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
