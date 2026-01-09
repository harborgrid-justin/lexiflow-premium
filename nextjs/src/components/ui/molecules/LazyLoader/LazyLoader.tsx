/**
 * @module components/common/LazyLoader
 * @category Common
 * @description Skeleton loader replacement using Shadcn Skeleton
 */

'use client';

import { Skeleton } from "@/components/ui/shadcn/skeleton";

interface LazyLoaderProps {
  message?: string;
}

export function LazyLoader({ message = "Loading..." }: LazyLoaderProps) {

  return (
    <div className="h-full w-full p-6 space-y-6 overflow-hidden" role="status" aria-live="polite" aria-label={message}>
      {/* Skeleton Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i: number) => (
          <Skeleton key={`skeleton-metric-${i}`} className="h-32 rounded-xl" />
        ))}
      </div>

      {/* Skeleton Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-100">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
        <div className="h-100">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground animate-pulse">{message}</span>
      </div>
    </div>
  );
}
