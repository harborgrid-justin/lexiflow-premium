/**
 * @module enterprise/dashboard/RevenueOverview
 * @category Enterprise Dashboard
 * @description Revenue and billing overview widget with charts
 */

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  expenses?: number;
  profit?: number;
}

export interface RevenueOverviewProps {
  data: RevenueDataPoint[];
  totalRevenue: number;
  totalExpenses?: number;
  netProfit?: number;
  periodLabel?: string;
  chartType?: 'area' | 'bar';
  showExpenses?: boolean;
  className?: string;
  currency?: string;
}

/**
 * RevenueOverview - Revenue and billing visualization widget
 * Displays revenue trends with interactive charts
 */
const RevenueOverviewComponent: React.FC<RevenueOverviewProps> = ({
  data,
  totalRevenue,
  totalExpenses,
  netProfit,
  periodLabel = 'Last 12 Months',
  chartType = 'area',
  showExpenses = false,
  className,
  currency = 'USD',
}) => {
  const { theme } = useTheme();
  const [activeChart, setActiveChart] = useState<'area' | 'bar'>(chartType);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatShortCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value}`;
  };

  interface TooltipPayload {
    name: string;
    value: number;
    color: string;
  }

  interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={cn(
            'p-3 rounded-lg shadow-lg border',
            theme.surface.raised,
            theme.border.default
          )}
        >
          <p className={cn('text-sm font-medium mb-2', theme.text.primary)}>{label}</p>
          {payload.map((entry, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const profitMargin =
    totalExpenses && totalRevenue > 0
      ? ((totalRevenue - totalExpenses) / totalRevenue) * 100
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'p-6 rounded-xl border shadow-sm',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className={cn('text-lg font-bold', theme.text.primary)}>Revenue Overview</h3>
          <p className={cn('text-sm mt-1 flex items-center gap-1', theme.text.tertiary)}>
            <Calendar className="h-3 w-3" />
            {periodLabel}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveChart('area')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeChart === 'area'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            )}
          >
            Area
          </button>
          <button
            onClick={() => setActiveChart('bar')}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
              activeChart === 'bar'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            )}
          >
            Bar
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'p-4 rounded-lg border',
            'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
            'border-blue-200 dark:border-blue-800'
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Total Revenue
            </p>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(totalRevenue)}
          </p>
        </motion.div>

        {showExpenses && totalExpenses !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              'p-4 rounded-lg border',
              'bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20',
              'border-rose-200 dark:border-rose-800'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <p className="text-xs font-medium text-rose-700 dark:text-rose-300">
                Total Expenses
              </p>
            </div>
            <p className="text-2xl font-bold text-rose-900 dark:text-rose-100">
              {formatCurrency(totalExpenses)}
            </p>
          </motion.div>
        )}

        {netProfit !== undefined && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className={cn(
              'p-4 rounded-lg border',
              'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20',
              'border-emerald-200 dark:border-emerald-800'
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Net Profit
              </p>
            </div>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              {formatCurrency(netProfit)}
            </p>
            {profitMargin > 0 && (
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                {profitMargin.toFixed(1)}% margin
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Chart */}
      <motion.div
        key={activeChart}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-80"
      >
        <ResponsiveContainer width="100%" height="100%">
          {activeChart === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                {showExpenses && (
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="period"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={formatShortCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
                name="Revenue"
              />
              {showExpenses && (
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#f43f5e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  name="Expenses"
                />
              )}
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="period"
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#9ca3af"
                style={{ fontSize: '12px' }}
                tickFormatter={formatShortCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" radius={[8, 8, 0, 0]} />
              {showExpenses && (
                <Bar
                  dataKey="expenses"
                  fill="#f43f5e"
                  name="Expenses"
                  radius={[8, 8, 0, 0]}
                />
              )}
            </BarChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export const RevenueOverview = React.memo(RevenueOverviewComponent);
RevenueOverview.displayName = 'RevenueOverview';
export default RevenueOverview;
