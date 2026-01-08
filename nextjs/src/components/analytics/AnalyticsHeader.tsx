'use client';

/**
 * AnalyticsHeader Component
 * Header section for analytics pages with navigation, title, and actions
 *
 * @component
 */

import { Button } from '@/components/ui/shadcn/button';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types/analytics-module';
import { ArrowLeft, Download, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { DateRangeSelector } from './DateRangeSelector';

interface AnalyticsHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  onExport?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function AnalyticsHeader({
  title,
  subtitle,
  backHref = '/analytics',
  dateRange,
  onDateRangeChange,
  onExport,
  onRefresh,
  isRefreshing,
  className,
  children,
}: AnalyticsHeaderProps): React.JSX.Element {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between', className)}>
      {/* Left side: Navigation and title */}
      <div className="flex items-center gap-4">
        {backHref && (
          <Link
            href={backHref}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right side: Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <DateRangeSelector value={dateRange} onChange={onDateRangeChange} />

        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        )}

        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        )}

        {children}
      </div>
    </div>
  );
}

AnalyticsHeader.displayName = 'AnalyticsHeader';
