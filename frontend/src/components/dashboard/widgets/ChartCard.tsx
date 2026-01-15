/**
 * @module components/dashboard/widgets/ChartCard
 * @category Dashboard Widgets
 * @description Wrapper component for Recharts with consistent styling and features
 * Provides loading states, error handling, and export capabilities
 */

import { cn } from '@/lib/cn';
import { Button } from '@/components/atoms/Button/Button';
import { useTheme } from '@/theme';
import { Download, LucideIcon, Maximize2, RefreshCw } from 'lucide-react';
import React, { useCallback, useState } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ChartCardProps {
  /** Chart title */
  title: string;
  /** Chart subtitle */
  subtitle?: string;
  /** Chart content */
  children: React.ReactNode;
  /** Custom icon */
  icon?: LucideIcon;
  /** Loading state */
  isLoading?: boolean;
  /** Error state */
  error?: string | null;
  /** Refresh handler */
  onRefresh?: () => void;
  /** Export handler */
  onExport?: () => void;
  /** Expand handler */
  onExpand?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Chart height */
  height?: number | string;
  /** Show action buttons */
  showActions?: boolean;
  /** Custom actions */
  actions?: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  icon: Icon,
  isLoading = false,
  error = null,
  onRefresh,
  onExport,
  onExpand,
  className,
  height = 300,
  showActions = true,
  actions,
}) => {
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [onRefresh, isRefreshing]);

  const { tokens } = useTheme();

  return (
    <div
      style={{
        backgroundColor: theme.surface.default,
        borderColor: theme.border.default,
        borderRadius: tokens.borderRadius.xl,
        boxShadow: tokens.shadows.sm,
        transition: tokens.transitions.smooth,
      }}
      className={cn(
        'border overflow-hidden hover:shadow-md',
        className
      )}
    >
      {/* Header */}
      <div className={cn('px-6 py-4 border-b', theme.border.default)}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {Icon && (
              <div className={cn('p-2 rounded-lg', theme.surface.highlight)}>
                <Icon className={cn('h-5 w-5', theme.text.secondary)} />
              </div>
            )}
            <div className="flex-1">
              <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
                {title}
              </h3>
              {subtitle && (
                <p className={cn('text-sm mt-1', theme.text.tertiary)}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2">
              {actions}
              {onRefresh && (
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing || isLoading}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'hover:bg-slate-100 dark:hover:bg-slate-800',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isRefreshing && 'animate-spin'
                  )}
                  title="Refresh data"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              )}
              {onExpand && (
                <button
                  onClick={onExpand}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  title="Expand chart"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              )}
              {onExport && (
                <button
                  onClick={onExport}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  title="Export data"
                >
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-gray-300 border-t-blue-600" />
              <p className={cn('text-sm', theme.text.tertiary)}>Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-3">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className={cn('text-sm font-medium mb-1', theme.text.primary)}>Failed to load chart</p>
              <p className={cn('text-xs', theme.text.tertiary)}>{error}</p>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="mt-4"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

ChartCard.displayName = 'ChartCard';
