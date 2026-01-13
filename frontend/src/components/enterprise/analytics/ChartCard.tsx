/**
 * ChartCard Component
 * Wrapper component for Recharts with consistent styling
 */

import { Download, RefreshCw, Maximize2 } from 'lucide-react';
import React from "react";

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  onRefresh?: () => void;
  onExport?: () => void;
  onExpand?: () => void;
  actions?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className = '',
  loading = false,
  onRefresh,
  onExport,
  onExpand,
  actions,
}: ChartCardProps) {
  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="Export data"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
          {onExpand && (
            <button
              onClick={onExpand}
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              title="Expand view"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Content */}
      <div className="relative">
        {loading ? (
          <div className="flex h-80 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />
          </div>
        ) : (
          <div className="h-80">{children}</div>
        )}
      </div>
    </div>
  );
}
