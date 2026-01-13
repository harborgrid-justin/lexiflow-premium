/**
 * Route Loading Components
 *
 * Provides consistent loading states and skeleton loaders for:
 * - Full page loading
 * - Section loading
 * - Card skeletons
 * - Table skeletons
 * - Page header skeletons
 *
 * Used as Suspense fallbacks and HydrateFallback components
 *
 * @module routes/_shared/RouteLoading
 */

import { useTheme } from '@/features/theme';
import { memo } from 'react';
import type { RouteLoadingProps, SkeletonProps } from './types';

// ============================================================================
// Skeleton Base Component
// ============================================================================

interface SkeletonBaseProps {
  className?: string;
  animate?: boolean;
}

const SkeletonBase = memo(function SkeletonBase({
  className = '',
  animate = true,
}: SkeletonBaseProps) {
  const { theme } = useTheme();
  return (
    <div
      className={`rounded ${animate ? 'animate-pulse' : ''} ${className}`}
      style={{ backgroundColor: theme.surface.default }}
      aria-hidden="true"
    />
  );
});

// ============================================================================
// Spinner Component
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Spinner = memo(function Spinner({
  size = 'md',
  className = '',
}: SpinnerProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${className}`}
      style={{ color: theme.primary.DEFAULT }}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
});

// ============================================================================
// Route Loading Component
// ============================================================================

/**
 * Main route loading indicator
 * Use for Suspense fallbacks and data loading states
 */
export const RouteLoading = memo(function RouteLoading({
  message = 'Loading...',
  fullPage = false,
  className = '',
}: RouteLoadingProps) {
  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-label={message}
    >
      <Spinner size={fullPage ? 'lg' : 'md'} />
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        {content}
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      {content}
    </div>
  );
});

// ============================================================================
// Route Loading Skeleton
// ============================================================================

/**
 * Full route skeleton with header and content area
 * Use for HydrateFallback or initial page load
 */
export const RouteLoadingSkeleton = memo(function RouteLoadingSkeleton({
  className = '',
}: { className?: string }) {
  return (
    <div className={`p-8 ${className}`} aria-hidden="true">
      {/* Page Header Skeleton */}
      <div className="mb-8">
        <SkeletonBase className="mb-2 h-8 w-64" />
        <SkeletonBase className="h-4 w-96" />
      </div>

      {/* Action Bar Skeleton */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <SkeletonBase className="h-10 w-32" />
          <SkeletonBase className="h-10 w-24" />
        </div>
        <SkeletonBase className="h-10 w-64" />
      </div>

      {/* Content Grid Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// Card Skeleton
// ============================================================================

/**
 * Individual card skeleton for list views
 */
export const CardSkeleton = memo(function CardSkeleton({
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`}
      aria-hidden="true"
    >
      <div className="mb-4 flex items-start justify-between">
        <SkeletonBase className="h-6 w-3/4" />
        <SkeletonBase className="h-6 w-16 rounded-full" />
      </div>
      <SkeletonBase className="mb-3 h-4 w-full" />
      <SkeletonBase className="mb-3 h-4 w-5/6" />
      <div className="mt-4 flex items-center gap-2">
        <SkeletonBase className="h-8 w-8 rounded-full" />
        <SkeletonBase className="h-4 w-24" />
      </div>
    </div>
  );
});

// ============================================================================
// Table Skeleton
// ============================================================================

interface TableSkeletonProps extends SkeletonProps {
  columns?: number;
  rows?: number;
}

/**
 * Table skeleton for data tables
 */
export const TableSkeleton = memo(function TableSkeleton({
  columns = 5,
  rows = 5,
  className = '',
}: TableSkeletonProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 ${className}`}
      aria-hidden="true"
    >
      {/* Header Row */}
      <div className="flex gap-4 border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBase key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Data Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 border-b border-gray-100 p-4 last:border-b-0 dark:border-gray-700"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonBase
              key={colIndex}
              className={`h-4 flex-1 ${colIndex === 0 ? 'w-1/4' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

// ============================================================================
// Page Header Skeleton
// ============================================================================

/**
 * Page header skeleton with breadcrumbs
 */
export const PageHeaderSkeleton = memo(function PageHeaderSkeleton({
  className = '',
}: SkeletonProps) {
  return (
    <div className={`mb-8 ${className}`} aria-hidden="true">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-2">
        <SkeletonBase className="h-4 w-16" />
        <SkeletonBase className="h-4 w-4" />
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-4 w-4" />
        <SkeletonBase className="h-4 w-32" />
      </div>

      {/* Title and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <SkeletonBase className="mb-2 h-8 w-64" />
          <SkeletonBase className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <SkeletonBase className="h-10 w-24" />
          <SkeletonBase className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// Detail Page Skeleton
// ============================================================================

/**
 * Detail page skeleton for entity detail views
 */
export const DetailPageSkeleton = memo(function DetailPageSkeleton({
  className = '',
}: SkeletonProps) {
  return (
    <div className={`p-8 ${className}`} aria-hidden="true">
      <PageHeaderSkeleton />

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Info Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <SkeletonBase className="mb-4 h-6 w-32" />
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <SkeletonBase className="mb-2 h-4 w-20" />
                  <SkeletonBase className="h-5 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <SkeletonBase className="mb-4 h-6 w-24" />
            <SkeletonBase className="mb-2 h-4 w-full" />
            <SkeletonBase className="mb-2 h-4 w-full" />
            <SkeletonBase className="h-4 w-3/4" />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
});

// Also export the spinner for use in other components
export { Spinner };
