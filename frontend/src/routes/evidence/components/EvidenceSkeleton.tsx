/**
 * @module components/evidence/EvidenceSkeleton
 * @description Loading skeleton components for Evidence Vault
 */

import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';

/**
 * Skeleton for Evidence Inventory list
 */
export const EvidenceInventorySkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 h-full flex flex-col animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className={cn("h-8 w-48 rounded mb-2", theme.surface.highlight)} />
          <div className={cn("h-4 w-64 rounded", theme.surface.highlight)} />
        </div>
        <div className="flex gap-2">
          <div className={cn("h-10 w-24 rounded", theme.surface.highlight)} />
          <div className={cn("h-10 w-32 rounded", theme.surface.highlight)} />
        </div>
      </div>

      {/* Table skeleton */}
      <div className={cn("flex-1 border rounded-lg overflow-hidden", theme.border.default)}>
        <div className={cn("flex items-center px-6 py-3 border-b", theme.surface.highlight, theme.border.default)}>
          <div className="w-[15%] h-4 bg-slate-300 rounded" />
          <div className="w-[25%] h-4 bg-slate-300 rounded ml-4" />
          <div className="w-[10%] h-4 bg-slate-300 rounded ml-4" />
          <div className="w-[15%] h-4 bg-slate-300 rounded ml-4" />
        </div>

        {[...Array(8)].map((_, idx) => (
          <div
            key={idx}
            className={cn("flex items-center px-6 py-4 border-b", theme.border.default)}
          >
            <div className="w-[15%] h-4 bg-slate-200 rounded" />
            <div className="w-[25%] flex items-center ml-4">
              <div className="h-10 w-10 bg-slate-300 rounded mr-3" />
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-slate-200 rounded mb-2" />
                <div className="h-3 w-1/2 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="w-[10%] h-4 bg-slate-200 rounded ml-4" />
            <div className="w-[15%] h-4 bg-slate-200 rounded ml-4" />
            <div className="w-[15%] h-4 bg-slate-200 rounded ml-4" />
            <div className="w-[10%] h-6 w-20 bg-slate-200 rounded ml-4" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Evidence Detail view
 */
export const EvidenceDetailSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="h-full flex flex-col space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={cn("h-10 w-10 rounded-full", theme.surface.highlight)} />
          <div>
            <div className={cn("h-8 w-64 rounded mb-2", theme.surface.highlight)} />
            <div className={cn("h-4 w-48 rounded", theme.surface.highlight)} />
          </div>
        </div>
        <div className="flex gap-2">
          <div className={cn("h-10 w-32 rounded", theme.surface.highlight)} />
          <div className={cn("h-10 w-40 rounded", theme.surface.highlight)} />
          <div className={cn("h-10 w-36 rounded", theme.surface.highlight)} />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="flex space-x-4 border-b pb-3">
        {[...Array(5)].map((_, idx) => (
          <div key={idx} className={cn("h-4 w-24 rounded", theme.surface.highlight)} />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className={cn("border rounded-lg p-6", theme.border.default)}>
            <div className={cn("h-6 w-32 rounded mb-4", theme.surface.highlight)} />
            <div className="space-y-3">
              <div className={cn("h-4 w-full rounded", theme.surface.highlight)} />
              <div className={cn("h-4 w-5/6 rounded", theme.surface.highlight)} />
              <div className={cn("h-4 w-4/6 rounded", theme.surface.highlight)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Skeleton for Chain of Custody log
 */
export const CustodyLogSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-pulse">
      <div className={cn("p-4 rounded-lg border flex justify-between items-center", theme.border.default)}>
        <div>
          <div className={cn("h-5 w-48 rounded mb-2", theme.surface.highlight)} />
          <div className={cn("h-4 w-64 rounded", theme.surface.highlight)} />
        </div>
        <div className={cn("h-10 w-32 rounded", theme.surface.highlight)} />
      </div>

      <div className={cn("rounded-lg border", theme.border.default)}>
        <div className={cn("p-4 border-b", theme.surface.highlight, theme.border.default)}>
          <div className="h-4 w-32 bg-slate-300 rounded" />
        </div>
        <div className="divide-y">
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className={cn("p-4 flex items-start gap-4", theme.border.default)}>
              <div className={cn("h-10 w-10 rounded-full", theme.surface.highlight)} />
              <div className="flex-1">
                <div className={cn("h-4 w-48 rounded mb-2", theme.surface.highlight)} />
                <div className={cn("h-3 w-32 rounded mb-3", theme.surface.highlight)} />
                <div className={cn("h-12 w-full rounded", theme.surface.highlight)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Evidence Intake wizard
 */
export const EvidenceIntakeSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="max-w-3xl mx-auto py-6 animate-pulse">
      <div className="flex items-center mb-6">
        <div className={cn("h-6 w-6 rounded mr-4", theme.surface.highlight)} />
        <div className={cn("h-8 w-64 rounded", theme.surface.highlight)} />
      </div>

      <div className={cn("border rounded-lg p-6", theme.border.default)}>
        <div className="flex justify-between mb-8">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center">
              <div className={cn("h-10 w-10 rounded-full mr-3", theme.surface.highlight)} />
              <div className={cn("h-4 w-24 rounded", theme.surface.highlight)} />
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className={cn("h-64 border-2 border-dashed rounded-lg flex items-center justify-center", theme.border.default)}>
            <div className={cn("h-12 w-12 rounded", theme.surface.highlight)} />
          </div>
          <div className={cn("h-10 w-32 rounded mx-auto", theme.surface.highlight)} />
        </div>
      </div>
    </div>
  );
};

/**
 * Skeleton for Evidence Forensics view
 */
export const EvidenceForensicsSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-pulse">
      <div className={cn("border rounded-lg p-6", theme.border.default)}>
        <div className={cn("h-6 w-48 rounded mb-4", theme.surface.highlight)} />
        <div className={cn("h-32 rounded", theme.surface.highlight)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className={cn("border rounded-lg p-6", theme.border.default)}>
            <div className={cn("h-6 w-40 rounded mb-4", theme.surface.highlight)} />
            <div className="flex flex-col items-center py-6">
              <div className={cn("h-16 w-16 rounded-full mb-4", theme.surface.highlight)} />
              <div className={cn("h-4 w-48 rounded mb-4", theme.surface.highlight)} />
              <div className={cn("h-10 w-32 rounded", theme.surface.highlight)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
