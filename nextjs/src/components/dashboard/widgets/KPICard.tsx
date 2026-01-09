'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/shadcn/card';
import { Progress } from '@/components/ui/shadcn/progress';

export interface KPICardProps {
  label: string;
  value: number | string;
  previousValue?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray';
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
  onClick?: () => void;
  target?: number;
  currency?: string;
}

const colorMap = {
  blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400',
  green: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400',
  purple: 'text-purple-600 bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400',
  orange: 'text-orange-600 bg-orange-100 dark:bg-orange-900/40 dark:text-orange-400',
  red: 'text-red-600 bg-red-100 dark:bg-red-900/40 dark:text-red-400',
  gray: 'text-gray-600 bg-gray-100 dark:bg-gray-900/40 dark:text-gray-400',
};

export function KPICard({
  label,
  value,
  previousValue,
  changePercentage,
  trend,
  icon: Icon,
  format = 'number',
  color = 'blue',
  subtitle,
  isLoading = false,
  onClick,
  target,
  currency = '$',
}: KPICardProps) {
  // Calculate change if previous value provided
  const change = React.useMemo(() => {
    if (changePercentage !== undefined) {
      return { percentage: changePercentage, trend: trend || 'neutral' };
    }
    if (typeof value === 'number' && previousValue !== undefined) {
      if (previousValue === 0) return { percentage: 0, trend: 'neutral' };
      const percentage = ((value - previousValue) / previousValue) * 100;
      const t = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
      return { percentage, trend: t };
    }
    return { percentage: 0, trend: trend || 'neutral' };
  }, [value, previousValue, changePercentage, trend]);

  const progressPercent = target && typeof value === 'number' ? (value / target) * 100 : undefined;
  const TrendIcon = change.trend === 'up' ? TrendingUp : change.trend === 'down' ? TrendingDown : Minus;

  const formatVal = (v: number | string) => {
    if (typeof v === 'string') return v;
    if (format === 'currency') return `${currency}${v.toLocaleString()}`;
    if (format === 'percentage') return `${v}%`;
    return v.toLocaleString();
  }

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
              {label}
            </p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          {Icon && (
            <div className={`p-3 rounded-lg ${colorMap[color]}`}>
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="text-3xl font-bold mb-3">
          {formatVal(value)}
        </div>

        {(changePercentage !== undefined || previousValue !== undefined) && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`flex items-center gap-1 text-sm font-medium ${change.trend === 'up' ? 'text-emerald-600' : change.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}>
              <TrendIcon className="h-4 w-4" />
              <span>{Math.abs(change.percentage).toFixed(1)}%</span>
            </div>
            <span className="text-xs text-muted-foreground">vs previous period</span>
          </div>
        )}

        {target && progressPercent !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progressPercent.toFixed(0)}%</span>
            </div>
            <Progress value={Math.min(progressPercent, 100)} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
