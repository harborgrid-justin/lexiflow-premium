'use client';

/**
 * ChartCard Component
 * Container for charts with title, subtitle, and optional actions
 *
 * @component
 */

import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';
import * as React from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  height?: number | string;
  actions?: React.ReactNode;
  loading?: boolean;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  height = 300,
  actions,
  loading,
}: ChartCardProps): React.JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>
        {actions ? (
          actions
        ) : (
          <button
            type="button"
            className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
            aria-label="Chart options"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Chart Content */}
      <div
        className="p-4"
        style={{ height: typeof height === 'number' ? `${height}px` : height }}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

ChartCard.displayName = 'ChartCard';
