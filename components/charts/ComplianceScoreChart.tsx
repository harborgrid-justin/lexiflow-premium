import React from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export interface ComplianceScoreData {
  category: string;
  score: number;
  maxScore?: number;
  status?: 'good' | 'warning' | 'critical';
}

export interface ComplianceScoreChartProps {
  data: ComplianceScoreData[];
  title?: string;
  description?: string;
  height?: number;
  showStatus?: boolean;
  className?: string;
}

export const ComplianceScoreChart: React.FC<ComplianceScoreChartProps> = ({
  data,
  title = 'Compliance Score',
  description = 'Compliance metrics across categories',
  height = 400,
  showStatus = true,
  className = '',
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const maxScore = data.maxScore || 100;
      const percentage = (data.score / maxScore) * 100;

      return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            {data.category}
          </p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Score:</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {data.score} / {maxScore} ({percentage.toFixed(1)}%)
            </span>
          </div>
          {data.status && (
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  data.status === 'good'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : data.status === 'warning'
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const normalizedData = data.map((item) => ({
    ...item,
    score: item.score,
    fullMark: item.maxScore || 100,
  }));

  const avgScore =
    data.reduce((sum, item) => sum + item.score, 0) / data.length;
  const maxPossible =
    data.reduce((sum, item) => sum + (item.maxScore || 100), 0) / data.length;
  const overallPercentage = (avgScore / maxPossible) * 100;

  const getOverallStatus = () => {
    if (overallPercentage >= 80) return 'good';
    if (overallPercentage >= 60) return 'warning';
    return 'critical';
  };

  const overallStatus = getOverallStatus();

  const statusConfig = {
    good: {
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      icon: CheckCircle,
    },
    warning: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: AlertTriangle,
    },
    critical: {
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      icon: AlertTriangle,
    },
  };

  const StatusIcon = statusConfig[overallStatus].icon;

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
            <div className={`text-3xl font-bold ${statusConfig[overallStatus].color}`}>
              {overallPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Overall Score
            </div>
          </div>
        </div>

        {/* Overall Status */}
        <div
          className={`flex items-center gap-3 p-4 rounded-lg ${statusConfig[overallStatus].bgColor}`}
        >
          <StatusIcon className={`w-6 h-6 ${statusConfig[overallStatus].color}`} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              {overallStatus === 'good'
                ? 'Excellent Compliance'
                : overallStatus === 'warning'
                ? 'Requires Attention'
                : 'Critical Issues'}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {overallStatus === 'good'
                ? 'All systems operating within compliance standards'
                : overallStatus === 'warning'
                ? 'Some areas need improvement'
                : 'Immediate action required'}
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={normalizedData}>
          <PolarGrid stroke="currentColor" className="stroke-gray-300 dark:stroke-gray-600" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400 text-xs"
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: 'currentColor' }}
            className="text-gray-600 dark:text-gray-400"
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.6}
            animationDuration={1000}
          />
          <Tooltip content={<CustomTooltip />} />
        </RadarChart>
      </ResponsiveContainer>

      {/* Category Breakdown */}
      {showStatus && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Category Breakdown
          </h4>
          <div className="space-y-2">
            {data.map((item, index) => {
              const maxScore = item.maxScore || 100;
              const percentage = (item.score / maxScore) * 100;
              const status = item.status || (
                percentage >= 80 ? 'good' : percentage >= 60 ? 'warning' : 'critical'
              );

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {item.score}/{maxScore}
                        </span>
                        <Shield
                          className={`w-3 h-3 ${
                            status === 'good'
                              ? 'text-green-600 dark:text-green-400'
                              : status === 'warning'
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-red-600 dark:text-red-400'
                          }`}
                        />
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          status === 'good'
                            ? 'bg-green-500'
                            : status === 'warning'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
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

export default ComplianceScoreChart;
