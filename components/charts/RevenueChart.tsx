import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface RevenueData {
  period: string;
  revenue: number;
  target?: number;
  growth?: number;
  forecast?: number;
}

export interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
  description?: string;
  height?: number;
  currency?: string;
  showTarget?: boolean;
  showForecast?: boolean;
  showGrowth?: boolean;
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'Revenue Analysis',
  description = 'Revenue trends and projections',
  height = 400,
  currency = '$',
  showTarget = true,
  showForecast = true,
  showGrowth = true,
  className = '',
}) => {
  const [activeView, setActiveView] = useState<'chart' | 'table'>('chart');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {entry.name}:
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {entry.name === 'Growth'
                  ? `${entry.value}%`
                  : `${currency}${entry.value.toLocaleString()}`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / data.length;
  const lastPeriodRevenue = data[data.length - 1]?.revenue || 0;
  const previousPeriodRevenue = data[data.length - 2]?.revenue || 0;
  const revenueChange =
    previousPeriodRevenue > 0
      ? ((lastPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100
      : 0;

  const totalTarget = data.reduce((sum, item) => sum + (item.target || 0), 0);
  const targetAchievement =
    totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 ${className}`}
      role="figure"
      aria-label={title}
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView('chart')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeView === 'chart'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Chart
            </button>
            <button
              onClick={() => setActiveView('table')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                activeView === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Total Revenue
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {currency}
              {totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Average
            </div>
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {currency}
              {avgRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              Change
            </div>
            <div className={`text-lg font-bold flex items-center gap-1 ${
              revenueChange >= 0
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            }`}>
              {revenueChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(revenueChange).toFixed(1)}%
            </div>
          </div>
          {showTarget && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-3">
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Target Achievement
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {targetAchievement.toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart or Table */}
      {activeView === 'chart' ? (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="period"
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              className="text-gray-600 dark:text-gray-400"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => `${currency}${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />

            {showForecast && (
              <Area
                type="monotone"
                dataKey="forecast"
                stroke="#8b5cf6"
                strokeDasharray="5 5"
                fill="none"
                name="Forecast"
                animationDuration={1000}
              />
            )}

            <Bar
              dataKey="revenue"
              fill="url(#colorRevenue)"
              stroke="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Revenue"
              animationDuration={1000}
            />

            {showTarget && (
              <Line
                type="monotone"
                dataKey="target"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ fill: '#10b981', r: 4 }}
                name="Target"
                animationDuration={1000}
              />
            )}

            {showGrowth && (
              <Line
                type="monotone"
                dataKey="growth"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                name="Growth %"
                yAxisId="right"
                animationDuration={1000}
              />
            )}

            {showGrowth && (
              <YAxis
                yAxisId="right"
                orientation="right"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `${value}%`}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700 dark:text-gray-300">Period</th>
                <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Revenue</th>
                {showTarget && <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Target</th>}
                {showGrowth && <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Growth</th>}
                {showForecast && <th className="px-4 py-2 text-right text-gray-700 dark:text-gray-300">Forecast</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-2 text-gray-900 dark:text-white">{row.period}</td>
                  <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                    {currency}{row.revenue.toLocaleString()}
                  </td>
                  {showTarget && (
                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                      {row.target ? `${currency}${row.target.toLocaleString()}` : '-'}
                    </td>
                  )}
                  {showGrowth && (
                    <td className={`px-4 py-2 text-right font-medium ${
                      (row.growth || 0) >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {row.growth !== undefined ? `${row.growth}%` : '-'}
                    </td>
                  )}
                  {showForecast && (
                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">
                      {row.forecast ? `${currency}${row.forecast.toLocaleString()}` : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default RevenueChart;
