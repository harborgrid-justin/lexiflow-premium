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
  ReferenceLine,
} from 'recharts';
import { Users, AlertTriangle, TrendingUp } from 'lucide-react';

export interface WorkloadData {
  name: string;
  hours: number;
  capacity: number;
  cases: number;
  utilization?: number;
}

export interface WorkloadChartProps {
  data: WorkloadData[];
  title?: string;
  description?: string;
  height?: number;
  targetUtilization?: number;
  showUtilization?: boolean;
  className?: string;
}

export const WorkloadChart: React.FC<WorkloadChartProps> = ({
  data,
  title = 'Team Workload',
  description = 'Resource allocation and utilization',
  height = 400,
  targetUtilization = 80,
  showUtilization = true,
  className = '',
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const utilization = ((data.hours / data.capacity) * 100).toFixed(1);

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
          <p className="font-semibold text-gray-900 dark:text-white mb-3">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Hours:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data.hours}h / {data.capacity}h
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Utilization:</span>
              <span
                className={`text-sm font-medium ${
                  parseFloat(utilization) > targetUtilization
                    ? 'text-red-600 dark:text-red-400'
                    : parseFloat(utilization) > targetUtilization * 0.9
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-green-600 dark:text-green-400'
                }`}
              >
                {utilization}%
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">Cases:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {data.cases}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (utilization: number) => {
    if (utilization > targetUtilization) return '#ef4444'; // Red - Overloaded
    if (utilization > targetUtilization * 0.9) return '#f59e0b'; // Yellow - Near capacity
    if (utilization > 60) return '#10b981'; // Green - Good utilization
    return '#3b82f6'; // Blue - Under-utilized
  };

  const dataWithUtilization = data.map((item) => ({
    ...item,
    utilization: ((item.hours / item.capacity) * 100).toFixed(1),
  }));

  const avgUtilization =
    data.reduce((sum, item) => sum + (item.hours / item.capacity) * 100, 0) / data.length;

  const overloadedCount = data.filter(
    (item) => (item.hours / item.capacity) * 100 > targetUtilization
  ).length;

  const totalHours = data.reduce((sum, item) => sum + item.hours, 0);
  const totalCapacity = data.reduce((sum, item) => sum + item.capacity, 0);
  const totalCases = data.reduce((sum, item) => sum + item.cases, 0);

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
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Team Size</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {data.length}
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">Avg Utilization</span>
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {avgUtilization.toFixed(1)}%
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Cases</div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              {totalCases}
            </div>
          </div>

          <div
            className={`rounded-lg p-3 ${
              overloadedCount > 0
                ? 'bg-red-50 dark:bg-red-900/20'
                : 'bg-gray-50 dark:bg-gray-700/50'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {overloadedCount > 0 && (
                <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              )}
              <span className="text-xs text-gray-600 dark:text-gray-400">Overloaded</span>
            </div>
            <div
              className={`text-xl font-bold ${
                overloadedCount > 0
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {overloadedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={dataWithUtilization}
          margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="name"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            className="text-gray-600 dark:text-gray-400"
            tick={{ fill: 'currentColor' }}
            label={{
              value: 'Hours',
              angle: -90,
              position: 'insideLeft',
              className: 'text-gray-600 dark:text-gray-400',
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />

          {/* Target Utilization Line */}
          <ReferenceLine
            y={targetUtilization}
            stroke="#f59e0b"
            strokeDasharray="3 3"
            label={{
              value: `Target ${targetUtilization}%`,
              position: 'right',
              fill: '#f59e0b',
            }}
          />

          <Bar
            dataKey="hours"
            name="Current Hours"
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          >
            {dataWithUtilization.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(parseFloat(entry.utilization))}
              />
            ))}
          </Bar>

          <Bar
            dataKey="capacity"
            name="Capacity"
            fill="#9ca3af"
            opacity={0.3}
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Utilization Details */}
      {showUtilization && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Individual Utilization
          </h4>
          <div className="space-y-2">
            {dataWithUtilization.map((item, index) => {
              const utilization = parseFloat(item.utilization);
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-700 dark:text-gray-300 truncate">
                    {item.name}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {item.hours}h / {item.capacity}h
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          utilization > targetUtilization
                            ? 'text-red-600 dark:text-red-400'
                            : utilization > targetUtilization * 0.9
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : 'text-green-600 dark:text-green-400'
                        }`}
                      >
                        {utilization}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(utilization, 100)}%`,
                          backgroundColor: getBarColor(utilization),
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-xs text-gray-600 dark:text-gray-400">
                    {item.cases} cases
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WorkloadChart;
