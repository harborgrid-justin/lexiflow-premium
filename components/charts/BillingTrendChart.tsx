import React from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface BillingTrendData {
  month: string;
  billed: number;
  collected: number;
  outstanding: number;
}

export interface BillingTrendChartProps {
  data: BillingTrendData[];
  title?: string;
  description?: string;
  height?: number;
  showArea?: boolean;
  currency?: string;
  className?: string;
}

export const BillingTrendChart: React.FC<BillingTrendChartProps> = ({
  data,
  title = 'Billing Trends',
  description = 'Monthly billing performance overview',
  height = 350,
  showArea = false,
  currency = '$',
  className = '',
}) => {
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
                {currency}
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const Chart = showArea ? AreaChart : LineChart;

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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <Chart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="month"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            tickLine={{ stroke: 'currentColor' }}
            tickFormatter={(value) => `${currency}${value / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />

          {showArea ? (
            <>
              <defs>
                <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="billed"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#colorBilled)"
                name="Billed"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="collected"
                stroke="#3b82f6"
                strokeWidth={2}
                fill="url(#colorCollected)"
                name="Collected"
                animationDuration={1000}
              />
              <Area
                type="monotone"
                dataKey="outstanding"
                stroke="#f59e0b"
                strokeWidth={2}
                fill="url(#colorOutstanding)"
                name="Outstanding"
                animationDuration={1000}
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="billed"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981', r: 4 }}
                activeDot={{ r: 6 }}
                name="Billed"
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="collected"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
                name="Collected"
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="outstanding"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b', r: 4 }}
                activeDot={{ r: 6 }}
                name="Outstanding"
                animationDuration={1000}
              />
            </>
          )}
        </Chart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BillingTrendChart;
