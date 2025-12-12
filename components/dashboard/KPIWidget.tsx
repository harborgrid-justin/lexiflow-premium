import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface KPIWidgetProps {
  title: string;
  value: string | number;
  target?: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  period?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  className?: string;
}

export const KPIWidget: React.FC<KPIWidgetProps> = ({
  title,
  value,
  target,
  unit = '',
  trend = 'neutral',
  trendValue,
  period = 'vs last period',
  status = 'info',
  description,
  className = ''
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-500 dark:border-green-400';
      case 'warning':
        return 'border-yellow-500 dark:border-yellow-400';
      case 'danger':
        return 'border-red-500 dark:border-red-400';
      default:
        return 'border-blue-500 dark:border-blue-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'down':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700';
    }
  };

  const calculateProgress = () => {
    if (!target) return 0;
    const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    const numTarget = typeof target === 'string' ? parseFloat(target.replace(/[^0-9.]/g, '')) : target;
    return Math.min((numValue / numTarget) * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 ${getStatusColor()} ${className}`}
      role="region"
      aria-label={`KPI: ${title}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </h3>
          <div className="flex items-baseline gap-2">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
            >
              {value}
            </motion.span>
            {unit && (
              <span className="text-lg text-gray-600 dark:text-gray-400">{unit}</span>
            )}
          </div>
        </div>
        {target && (
          <div className="text-right">
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs mb-1">
              <Target className="w-3 h-3" />
              <span>Target</span>
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {target}{unit}
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar (if target exists) */}
      {target && (
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${calculateProgress()}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              className={`h-full ${
                status === 'success'
                  ? 'bg-green-500'
                  : status === 'warning'
                  ? 'bg-yellow-500'
                  : status === 'danger'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              role="progressbar"
              aria-valuenow={calculateProgress()}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progress: ${calculateProgress().toFixed(1)}%`}
            />
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {calculateProgress().toFixed(1)}% of target
            </span>
          </div>
        </div>
      )}

      {/* Trend */}
      {trendValue !== undefined && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-2"
        >
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}
          >
            {getTrendIcon()}
            <span>{Math.abs(trendValue)}%</span>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400">{period}</span>
        </motion.div>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{description}</p>
      )}
    </motion.div>
  );
};

export default KPIWidget;
