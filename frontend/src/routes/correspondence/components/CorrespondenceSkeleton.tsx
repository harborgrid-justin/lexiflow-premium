/**
 * @module components/correspondence/CorrespondenceSkeleton
 * @category Correspondence
 * @description Loading skeleton components for correspondence lists
 */

import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
/**
 * Skeleton for communication log items
 */
export function CommunicationLogSkeleton() {
  const { theme } = useTheme();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header skeleton */}
      <div className={cn("flex items-center px-4 py-3 border-b bg-slate-50 shrink-0", theme.border.default)}>
        <div className="w-24 h-3 bg-slate-200 rounded animate-pulse" />
        <div className="w-32 h-3 bg-slate-200 rounded animate-pulse ml-8" />
        <div className="flex-1 h-3 bg-slate-200 rounded animate-pulse ml-8" />
        <div className="w-40 h-3 bg-slate-200 rounded animate-pulse ml-8" />
        <div className="w-24 h-3 bg-slate-200 rounded animate-pulse ml-8 mr-4" />
        <div className="w-20 h-3 bg-slate-200 rounded animate-pulse" />
      </div>

      {/* Item skeletons */}
      <div className="flex-1 overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={`comm-log-skeleton-${i}`}
            className={cn(
              "flex items-center border-b px-4 h-[60px]",
              theme.border.default
            )}
          >
            <div className="w-24 shrink-0">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-32 shrink-0">
              <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex-1 min-w-0 pr-4">
              <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-40 shrink-0 space-y-1">
              <div className="h-3 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-24 shrink-0 mr-4">
              <div className="h-3 w-20 bg-slate-200 rounded animate-pulse ml-auto" />
            </div>
            <div className="w-20 shrink-0">
              <div className="h-6 w-16 bg-slate-200 rounded animate-pulse ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for service tracker cards
 */
export function ServiceTrackerSkeleton() {
  const { theme } = useTheme();

  return (
    <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-slate-50/50">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={`service-tracker-skeleton-${i}`}
            className={cn(
              "p-5 rounded-xl border shadow-sm flex flex-col",
              theme.surface.default,
              theme.border.default
            )}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            </div>

            <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse mb-1" />
            <div className="h-4 w-full bg-slate-200 rounded animate-pulse mb-4" />

            <div className={cn("mt-auto pt-4 border-t space-y-2", theme.border.default)}>
              <div className="flex justify-between">
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-20 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-slate-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for correspondence detail panel
 */
export function CorrespondenceDetailSkeleton() {
  const { theme } = useTheme();

  return (
    <div className={cn("h-full flex flex-col border-l shadow-xl bg-white", theme.border.default)}>
      <div className={cn("p-4 border-b flex justify-between items-center bg-slate-50", theme.border.default)}>
        <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-8 w-8 bg-slate-200 rounded animate-pulse" />
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <div className="h-6 w-3/4 bg-slate-200 rounded animate-pulse mb-2" />
          <div className="flex items-center gap-2 mb-4">
            <div className="h-5 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>

        <div className={cn("space-y-3 p-4 rounded-lg", theme.surface.default)}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>

        <div>
          <div className="h-3 w-24 bg-slate-200 rounded animate-pulse mb-2" />
          <div className={cn("p-4 rounded border space-y-2", theme.border.default)}>
            <div className="h-3 w-full bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-5/6 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <div className={cn("p-4 border-t", theme.border.default)}>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 bg-slate-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
};
