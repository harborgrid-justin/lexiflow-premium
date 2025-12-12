import React from 'react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = 'neutral',
  loading = false,
  onClick,
  className = ''
}) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 ${className}`}
        role="status"
        aria-label="Loading"
      >
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
          <div className="w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: onClick ? 1.02 : 1, translateY: onClick ? -4 : 0 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : 'article'}
      aria-label={`${title}: ${value}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {icon}
          </div>
        )}
        {change !== undefined && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}
            aria-label={`${trend === 'up' ? 'Increased' : trend === 'down' ? 'Decreased' : 'No change'} by ${Math.abs(change)}%`}
          >
            <span className="text-lg">{getTrendIcon()}</span>
            <span>{Math.abs(change)}%</span>
          </motion.div>
        )}
      </div>

      {/* Value */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2"
      >
        {value}
      </motion.h3>

      {/* Title */}
      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
        {title}
      </p>

      {/* Change Label */}
      {changeLabel && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
          {changeLabel}
        </p>
      )}
    </motion.div>
  );
};

export default DashboardCard;
