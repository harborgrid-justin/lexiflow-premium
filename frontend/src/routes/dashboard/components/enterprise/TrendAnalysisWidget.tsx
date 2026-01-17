/**
 * @module enterprise/dashboard/TrendAnalysisWidget
 * @category Enterprise Dashboard
 * @description Trend analysis widget with predictive insights and forecasting
 * Displays historical trends with AI-powered predictions
 */

import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Calendar,
  Info,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useTheme } from "@/hooks/useTheme";
import { cn } from '@/lib/cn';

import type { BaseDashboardProps, TimeSeriesDataPoint, TrendData } from '@/types/dashboard';

export interface TrendAnalysisWidgetProps extends BaseDashboardProps {
  title: string;
  data: TimeSeriesDataPoint[];
  predictions?: TimeSeriesDataPoint[];
  trendData: TrendData;
  metric: string;
  unit: string;
  chartType?: 'line' | 'area';
  showPredictions?: boolean;
  showConfidenceInterval?: boolean;
  showInsights?: boolean;
  comparisonPeriod?: string;
}

/**
 * TrendAnalysisWidget - Advanced trend analysis with predictions
 * Shows historical data with AI-powered forecasting
 */
export const TrendAnalysisWidgetComponent: React.FC<TrendAnalysisWidgetProps> = ({
  title,
  data,
  predictions = [],
  trendData,
  unit,
  chartType = 'area',
  showPredictions = true,
  showConfidenceInterval = true,
  showInsights = true,
  comparisonPeriod = 'vs Previous Period',
  className,
  isLoading = false,
  error,
}) => {
  const { theme } = useTheme();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  // DETERMINISTIC RENDERING: Memoize combined data to avoid recalculation on every render
  const combinedData = useMemo(() => {
    const historical = data.map((point) => ({
      ...point,
      timestamp: typeof point.timestamp === 'string' ? new Date(point.timestamp) : point.timestamp,
      actual: point.value,
      predicted: null,
      lowerBound: null,
      upperBound: null,
    }));

    const predicted = predictions.map((point) => ({
      ...point,
      timestamp: typeof point.timestamp === 'string' ? new Date(point.timestamp) : point.timestamp,
      actual: null,
      predicted: point.value,
      lowerBound: showConfidenceInterval ? point.value * 0.9 : null,
      upperBound: showConfidenceInterval ? point.value * 1.1 : null,
    }));

    return [...historical, ...predicted];
  }, [data, predictions, showConfidenceInterval]);

  // LAYOUT STABILITY: Memoize filtered data for consistent rendering
  const filteredData = useMemo(() => {
    if (selectedTimeRange === 'all') return combinedData;

    const now = new Date();
    const days = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    return combinedData.filter((point) => point.timestamp >= cutoff);
  }, [combinedData, selectedTimeRange]);

  const insights = useMemo(() => {
    const insights: { type: 'positive' | 'negative' | 'neutral'; message: string }[] = [];

    if (trendData.trend === 'up' && trendData.changePercentage > 10) {
      insights.push({
        type: 'positive',
        message: `Strong upward trend detected with ${trendData.changePercentage.toFixed(1)}% growth`,
      });
    } else if (trendData.trend === 'down' && trendData.changePercentage < -10) {
      insights.push({
        type: 'negative',
        message: `Significant decline of ${Math.abs(trendData.changePercentage).toFixed(1)}% requires attention`,
      });
    }

    if (trendData.prediction && trendData.confidence) {
      insights.push({
        type: 'neutral',
        message: `Predicted value: ${trendData.prediction.toLocaleString()} ${unit} (${(trendData.confidence * 100).toFixed(0)}% confidence)`,
      });
    }

    const avg = data.reduce((sum, point) => sum + point.value, 0) / data.length;
    const recent = data.slice(-5).reduce((sum, point) => sum + point.value, 0) / 5;
    if (recent > avg * 1.2) {
      insights.push({
        type: 'positive',
        message: 'Recent performance exceeds historical average by 20%',
      });
    }

    return insights;
  }, [trendData, data, unit]);

  const formatValue = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  const formatDate = (timestamp: Date): string => {
    return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  /**
   * Tooltip payload interface for trend data points
   */
  interface TooltipPayload {
    name: string;
    value: number | null;
    color: string;
    dataKey?: string;
    payload?: Record<string, unknown>;
  }

  /**
   * Props interface for custom trend tooltip
   */
  interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }

  /**
   * Custom tooltip for trend analysis chart
   * Displays historical and predicted values with formatting
   */
  const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={cn(
            'p-3 rounded-lg shadow-lg border',
            theme.surface.raised,
            theme.border.default
          )}
        >
          <p className={cn('text-sm font-medium mb-2', theme.text.primary)}>
            {label ? formatDate(new Date(label)) : ''}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: entry.color }} />
              <span className={theme.text.secondary}>
                {entry.name}: {entry.value?.toLocaleString() || 'N/A'} {unit}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = () => {
    if (trendData.trend === 'up') return TrendingUp;
    if (trendData.trend === 'down') return TrendingDown;
    return Activity;
  };

  const getTrendColor = () => {
    if (trendData.trend === 'up') return 'text-emerald-600 dark:text-emerald-400';
    if (trendData.trend === 'down') return 'text-rose-600 dark:text-rose-400';
    return theme.text.tertiary;
  };

  const getTrendBgColor = () => {
    if (trendData.trend === 'up') return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (trendData.trend === 'down') return 'bg-rose-100 dark:bg-rose-900/30';
    return 'bg-gray-100 dark:bg-gray-800';
  };

  const TrendIcon = getTrendIcon();

  if (error?.hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'p-6 rounded-xl border',
          'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          <div>
            <h3 className="font-bold text-rose-900 dark:text-rose-100">
              Failed to Load Trend Analysis
            </h3>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border shadow-sm',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className={cn('text-lg font-bold mb-1', theme.text.primary)}>{title}</h3>
            <p className={cn('text-xs flex items-center gap-1', theme.text.tertiary)}>
              <Calendar className="h-3 w-3" />
              {comparisonPeriod}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded transition-colors',
                  selectedTimeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                )}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Trend Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className={cn('p-3 rounded-lg', getTrendBgColor())}>
            <div className="flex items-center gap-2 mb-1">
              <TrendIcon className={cn('h-4 w-4', getTrendColor())} />
              <p className={cn('text-xs font-medium', getTrendColor())}>Current Trend</p>
            </div>
            <p className={cn('text-xl font-bold', getTrendColor())}>
              {trendData.changePercentage > 0 ? '+' : ''}
              {trendData.changePercentage.toFixed(1)}%
            </p>
          </div>

          <div className={cn('p-3 rounded-lg', theme.surface.raised)}>
            <div className="flex items-center gap-2 mb-1">
              <Activity className={cn('h-4 w-4', theme.text.tertiary)} />
              <p className={cn('text-xs font-medium', theme.text.tertiary)}>Current</p>
            </div>
            <p className={cn('text-xl font-bold', theme.text.primary)}>
              {trendData.current.toLocaleString()} {unit}
            </p>
          </div>

          {showPredictions && trendData.prediction && (
            <div className={cn('p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30')}>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">
                  Predicted
                </p>
              </div>
              <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                {trendData.prediction.toLocaleString()} {unit}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Activity className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatDate(new Date(value))}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={formatValue}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Confidence Interval */}
                  {showConfidenceInterval && showPredictions && (
                    <Area
                      type="monotone"
                      dataKey="upperBound"
                      stroke="none"
                      fill="#10b981"
                      fillOpacity={0.1}
                      name="Upper Bound"
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorActual)"
                    name="Actual"
                  />

                  {showPredictions && (
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#colorPredicted)"
                      name="Predicted"
                    />
                  )}

                  {/* Reference line for current date */}
                  <ReferenceLine
                    x={new Date().toISOString()}
                    stroke="#f59e0b"
                    strokeDasharray="3 3"
                    label={{ value: 'Today', fill: '#f59e0b', fontSize: 10 }}
                  />
                </AreaChart>
              ) : (
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                  <XAxis
                    dataKey="timestamp"
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => formatDate(new Date(value))}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={formatValue}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Actual"
                  />
                  {showPredictions && (
                    <Line
                      type="monotone"
                      dataKey="predicted"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      name="Predicted"
                    />
                  )}
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Insights */}
      {showInsights && insights.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <Info className={cn('h-4 w-4', theme.text.tertiary)} />
            <h4 className={cn('text-sm font-bold', theme.text.primary)}>Key Insights</h4>
          </div>
          <div className="space-y-2">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-3 rounded-lg border text-sm',
                  insight.type === 'positive' &&
                  'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200',
                  insight.type === 'negative' &&
                  'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200',
                  insight.type === 'neutral' &&
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                )}
              >
                {insight.message}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
