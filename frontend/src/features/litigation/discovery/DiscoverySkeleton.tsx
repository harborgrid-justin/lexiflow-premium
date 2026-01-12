/**
 * @module components/discovery/DiscoverySkeleton
 * @description Loading skeleton components for discovery center
 * Provides shimmer effects for better perceived performance
 */

import { useTheme } from '@/features/theme';
import { cn } from '@/shared/lib/cn';
import React from 'react';

// Base skeleton component with shimmer animation
const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  const { theme } = useTheme();
  return (
    <div
      className={cn(
        'animate-pulse rounded',
        theme.surface.highlight,
        className
      )}
    />
  );
};

/**
 * Discovery Requests Table Skeleton
 * Mimics the table layout of DiscoveryRequests component
 */
export const DiscoveryRequestsSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Table Header */}
      <div className={cn('rounded-lg border overflow-hidden', theme.border.default)}>
        <div className={cn('p-4 border-b', theme.surface.highlight, theme.border.default)}>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-[30%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[10%]" />
            <Skeleton className="h-4 w-[10%]" />
          </div>
        </div>

        {/* Table Rows */}
        {[...Array(5)].map((_, i) => (
          <div
            key={`discovery-request-row-${i}`}
            className={cn('p-6 border-b', theme.border.default)}
          >
            <div className="flex items-center gap-4">
              <div className="w-[30%] space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="w-[15%]">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="w-[15%]">
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="w-[20%] space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="w-[10%]">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="w-[10%] flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Privilege Log Skeleton
 * Mimics the table layout of PrivilegeLog component
 */
export const PrivilegeLogSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className={cn('p-4 rounded-lg border', theme.surface.highlight, theme.border.default)}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={cn('rounded-lg border overflow-hidden', theme.border.default)}>
        <div className={cn('p-4 border-b', theme.surface.highlight, theme.border.default)}>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[15%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[35%]" />
          </div>
        </div>

        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn('p-4 border-b', theme.border.default)}
          >
            <div className="flex gap-4">
              <div className="w-[15%] space-y-1">
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="w-[15%]">
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="w-[15%]">
                <Skeleton className="h-6 w-32 rounded-full" />
              </div>
              <div className="w-[20%] space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
              </div>
              <div className="w-[35%]">
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * ESI Dashboard Skeleton
 * Mimics the card layout of DiscoveryESI component
 */
export const ESIDashboardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Header */}
      <div className={cn('p-6 rounded-lg shadow-sm border', theme.surface.overlay, theme.border.default)}>
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="text-right space-y-1">
            <Skeleton className="h-8 w-24 ml-auto" />
            <Skeleton className="h-3 w-32 ml-auto" />
          </div>
        </div>
      </div>

      {/* Source Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={cn('p-6 rounded-lg border shadow-sm', theme.surface.default, theme.border.default)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full mt-4" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 flex-1 rounded" />
                <Skeleton className="h-8 flex-1 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Production Wizard Skeleton
 * Mimics the split-pane layout of DiscoveryProduction component
 */
export const ProductionWizardSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={cn('flex flex-col h-full rounded-lg shadow-sm border animate-fade-in', theme.surface.default, theme.border.default)}>
      {/* Header */}
      <div className={cn('p-4 border-b flex justify-between items-center', theme.border.default, theme.surface.highlight)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-3 w-64" />
          </div>
        </div>
        <Skeleton className="h-9 w-36 rounded" />
      </div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn('w-96 border-r p-6 space-y-6', theme.border.default, theme.surface.highlight)}>
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-10 w-full rounded" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-4">
          <div className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className={cn('border-2 border-dashed rounded-lg p-12 text-center', theme.border.default)}>
            <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-5 w-64 mx-auto mb-2" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={`timeline-item-${i}`} className={cn('flex items-center justify-between p-3 rounded border', theme.border.default)}>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Legal Holds Skeleton
 * Mimics the table layout of LegalHolds component
 */
export const LegalHoldsSkeleton: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Warning Banner */}
      <div className={cn('border p-4 rounded-lg flex gap-3', theme.status.warning.bg, theme.status.warning.border)}>
        <Skeleton className="h-6 w-6 rounded shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-36" />
      </div>

      {/* Table */}
      <div className={cn('rounded-lg border overflow-hidden', theme.border.default)}>
        <div className={cn('p-4 border-b', theme.surface.highlight, theme.border.default)}>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-[25%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[20%]" />
            <Skeleton className="h-4 w-[15%]" />
          </div>
        </div>

        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn('p-4 border-b', theme.border.default)}
          >
            <div className="flex items-center gap-4">
              <div className="w-[25%]">
                <Skeleton className="h-5 w-3/4" />
              </div>
              <div className="w-[20%]">
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="w-[20%]">
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="w-[20%]">
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <div className="w-[15%] text-right">
                <Skeleton className="h-8 w-20 ml-auto rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
