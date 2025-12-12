import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export interface TimeEntryData {
  category: string;
  billable: number;
  nonBillable: number;
  total?: number;
}

export interface TimeEntryChartProps {
  data: TimeEntryData[];
  title?: string;
  description?: string;
  height?: number;
  stacked?: boolean;
  horizontal?: boolean;
  className?: string;
}

export const TimeEntryChart: React.FC<TimeEntryChartProps> = ({
  data,
  title = 'Time Entries',
  description = 'Billable vs Non-billable hours',
  height = 350,
  stacked = true,
  horizontal = false,
  className = '',
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0);

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
                {entry.value.toFixed(1)}h
              </span>
            </div>
          ))}
          <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Total:
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {total.toFixed(1)}h
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const totalBillable = data.reduce((sum, item) => sum + item.billable, 0);
  const totalNonBillable = data.reduce((sum, item) => sum + item.nonBillable, 0);
  const totalHours = totalBillable + totalNonBillable;
  const billablePercentage = totalHours > 0 ? (totalBillable / totalHours) * 100 : 0;

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
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {totalHours.toFixed(1)}h
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Total Hours
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Billable</span>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400">
                {totalBillable.toFixed(1)}h ({billablePercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${billablePercentage}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">Non-billable</span>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {totalNonBillable.toFixed(1)}h ({(100 - billablePercentage).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gray-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${100 - billablePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          {horizontal ? (
            <>
              <XAxis
                type="number"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `${value}h`}
              />
              <YAxis
                type="category"
                dataKey="category"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
                width={100}
              />
            </>
          ) : (
            <>
              <XAxis
                dataKey="category"
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => `${value}h`}
              />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Bar
            dataKey="billable"
            fill="#10b981"
            name="Billable"
            radius={[8, 8, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
            animationDuration={1000}
          />
          <Bar
            dataKey="nonBillable"
            fill="#9ca3af"
            name="Non-billable"
            radius={[8, 8, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default TimeEntryChart;
