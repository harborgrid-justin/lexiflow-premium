/**
 * @module components/dashboard/widgets/StatWidget
 * @category Dashboard Widgets
 * @description Compact statistics widget for dashboard layouts
 * Lightweight alternative to KPICard for simpler metrics
 */

import { type LucideIcon } from 'lucide-react';

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StatWidgetProps {
  /** Stat label */
  label: string;
  /** Stat value */
  value: string | number;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional change text */
  change?: string;
  /** Change is positive */
  changePositive?: boolean;
  /** Widget color scheme */
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  /** Additional CSS classes */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function StatWidget({
  label,
  value,
  icon: Icon,
  change,
  changePositive = true,
  variant = 'default',
  className,
  onClick,
}: StatWidgetProps) {
  const { theme } = useTheme();

  const variantClasses = {
    default: 'border-gray-200 dark:border-gray-700',
    success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20',
    warning: 'border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20',
    danger: 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20',
  };

  const iconColors = {
    default: 'text-gray-600 dark:text-gray-400',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-orange-600 dark:text-orange-400',
    danger: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 transition-all duration-200',
        theme.surface.default,
        variantClasses[variant],
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-xs font-medium mb-2', theme.text.secondary)}>
            {label}
          </p>
          <p className={cn('text-2xl font-bold', theme.text.primary)}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className={cn(
              'text-xs font-medium mt-2',
              changePositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            )}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="ml-3">
            <Icon className={cn('h-8 w-8', iconColors[variant])} />
          </div>
        )}
      </div>
    </div>
  );
};

StatWidget.displayName = 'StatWidget';
