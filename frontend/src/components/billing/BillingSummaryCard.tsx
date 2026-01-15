/**
 * BillingSummaryCard Component
 * Summary card showing billing metrics and KPIs
 */

import { useTheme } from "@/hooks/useTheme";
import { Clock, DollarSign, FileText, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

interface BillingSummaryCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: 'dollar' | 'clock' | 'invoice' | 'trending';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const BillingSummaryCard: React.FC<BillingSummaryCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon = 'dollar',
  color = 'blue',
}) => {
  const icons = {
    dollar: DollarSign,
    clock: Clock,
    invoice: FileText,
    trending: TrendingUp,
  };

  const { tokens } = useTheme();

  const colors = {
    blue: {
      bg: tokens.colors.blue400 + '20',
      icon: tokens.colors.blue500,
      border: tokens.colors.blue400,
    },
    green: {
      bg: tokens.colors.success + '20',
      icon: tokens.colors.success,
      border: tokens.colors.emerald400,
    },
    yellow: {
      bg: tokens.colors.warning + '20',
      icon: tokens.colors.warning,
      border: tokens.colors.amber400,
    },
    red: {
      bg: tokens.colors.error + '20',
      icon: tokens.colors.error,
      border: tokens.colors.rose400,
    },
    purple: {
      bg: tokens.colors.accent + '20',
      icon: tokens.colors.accent,
      border: tokens.colors.indigo400,
    },
  };

  const Icon = icons[icon];
  const colorClasses = colors[color];

  return (
    <div
      className="rounded-lg border p-6 shadow-sm"
      style={{
        backgroundColor: tokens.colors.surface,
        borderColor: colorClasses.border,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium"
            style={{ color: tokens.colors.textMuted }}
          >
            {title}
          </p>
          <p
            className="mt-2 text-3xl font-semibold"
            style={{ color: tokens.colors.text }}
          >
            {value}
          </p>

          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {change >= 0 ? (
                <TrendingUp
                  className="h-4 w-4"
                  style={{ color: tokens.colors.success }}
                />
              ) : (
                <TrendingDown
                  className="h-4 w-4"
                  style={{ color: tokens.colors.error }}
                />
              )}
              <span
                className="text-sm font-medium"
                style={{ color: change >= 0 ? tokens.colors.success : tokens.colors.error }}
              >
                {change >= 0 ? '+' : ''}{change}%
              </span>
              {changeLabel && (
                <span
                  className="text-sm"
                  style={{ color: tokens.colors.textMuted }}
                >
                  {changeLabel}
                </span>
              )}
            </div>
          )}
        </div>

        <div
          className="rounded-full p-3"
          style={{ backgroundColor: colorClasses.bg }}
        >
          <Icon
            className="h-6 w-6"
            style={{ color: colorClasses.icon }}
          />
        </div>
      </div>
    </div>
  );
};
