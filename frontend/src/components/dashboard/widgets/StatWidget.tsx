/**
 * @module components/dashboard/widgets/StatWidget
 * @category Dashboard Widgets
 * @description Compact statistics widget for dashboard layouts
 * Lightweight alternative to KPICard for simpler metrics
 */

import { type LucideIcon } from 'lucide-react';
import React from 'react';

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

export const StatWidget: React.FC<StatWidgetProps> = ({
  label,
  value,
  icon: Icon,
  change,
  changePositive = true,
  variant = 'default',
  className,
  onClick,
}) => {
  const { theme, tokens } = useTheme();
  const toStyleValue = (value: unknown) => String(value);
  const classToken = (value: unknown) => String(value);
  const borderDefault = toStyleValue(theme.border.default);
  const surfaceDefault = toStyleValue(theme.surface.default);
  const textSecondaryClass = classToken(theme.text.secondary);

  const variantStyles = {
    default: { borderColor: borderDefault, backgroundColor: surfaceDefault },
    success: { borderColor: tokens.colors.emerald400, backgroundColor: tokens.colors.success + '20' },
    warning: { borderColor: tokens.colors.amber400, backgroundColor: tokens.colors.warning + '20' },
    danger: { borderColor: tokens.colors.rose400, backgroundColor: tokens.colors.error + '20' },
    info: { borderColor: tokens.colors.blue400, backgroundColor: tokens.colors.info + '20' },
  };

  const iconColors = {
    default: textSecondaryClass,
    success: tokens.colors.emerald500,
    warning: tokens.colors.amber400,
    danger: tokens.colors.error,
    info: tokens.colors.blue500,
  };

  return (
    <div
      style={{
        ...variantStyles[variant],
        borderRadius: tokens.borderRadius.lg,
        boxShadow: tokens.shadows.sm,
        transition: tokens.transitions.smooth,
      }}
      className={cn(
        'relative border p-4 transition-all',
        onClick && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-xs font-medium mb-2 text-text-muted')}>
            {label}
          </p>
          <p className={cn('text-2xl font-bold text-text')}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className="text-xs font-medium mt-2" style={{
              color: changePositive ? tokens.colors.success : tokens.colors.error
            }}>
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
