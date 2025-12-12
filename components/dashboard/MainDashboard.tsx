import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, Users, FileText, AlertCircle } from 'lucide-react';

interface DashboardProps {
  className?: string;
}

interface MetricData {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

export const MainDashboard: React.FC<DashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<MetricData[]>([
    {
      id: '1',
      title: 'Active Cases',
      value: 124,
      change: 12.5,
      trend: 'up',
      icon: <FileText className="w-6 h-6" />
    },
    {
      id: '2',
      title: 'Total Revenue',
      value: '$2.4M',
      change: 8.2,
      trend: 'up',
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      id: '3',
      title: 'Active Clients',
      value: 87,
      change: -3.1,
      trend: 'down',
      icon: <Users className="w-6 h-6" />
    },
    {
      id: '4',
      title: 'Pending Tasks',
      value: 43,
      change: 0,
      trend: 'neutral',
      icon: <AlertCircle className="w-6 h-6" />
    }
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut'
      }
    }
  };

  return (
    <div
      className={`w-full min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8 ${className}`}
      role="main"
      aria-label="Main Dashboard"
    >
      {/* Dashboard Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <LayoutDashboard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
          Welcome back! Here's your overview for today.
        </p>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
      >
        {metrics.map((metric) => (
          <motion.div
            key={metric.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, translateY: -4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
            tabIndex={0}
            role="article"
            aria-label={`${metric.title}: ${metric.value}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                {metric.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-sm font-medium ${
                  metric.trend === 'up'
                    ? 'text-green-600 dark:text-green-400'
                    : metric.trend === 'down'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {metric.value}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{metric.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Dashboard Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              Activity feed content goes here
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              {['New Case', 'Add Client', 'Create Document', 'Schedule Meeting'].map(
                (action, index) => (
                  <button
                    key={index}
                    className="w-full px-4 py-3 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {action}
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MainDashboard;
