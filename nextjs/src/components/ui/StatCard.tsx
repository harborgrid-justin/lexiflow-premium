'use client';

/**
 * Stat Card Component - Display metrics/statistics
 * Used in dashboards and analytics pages
 */

import { TrendingDown, TrendingUp } from 'lucide-react';
import { ReactNode } from 'react';
import { Card, CardBody } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down';
  trendValue?: string;
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  onClick,
}: StatCardProps) {
  return (
    <Card hoverable onClick={onClick} className="p-6">
      <CardBody className="p-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">
                {value}
              </p>
              {trend && trendValue && (
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${trend === 'up'
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                    }`}
                >
                  {trend === 'up' ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {trendValue}
                </div>
              )}
            </div>
            {subtitle && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                {subtitle}
              </p>
            )}
          </div>
          {icon && (
            <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
              {icon}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
