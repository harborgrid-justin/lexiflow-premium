import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertCircle, Clock, CheckCircle, TrendingUp } from 'lucide-react';

export interface CaseSummary {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  pendingCases: number;
  urgentCases: number;
  recentActivity: Array<{
    id: string;
    caseNumber: string;
    title: string;
    status: string;
    lastUpdate: Date;
  }>;
}

export interface CaseSummaryWidgetProps {
  data?: CaseSummary;
  loading?: boolean;
  onCaseClick?: (caseId: string) => void;
  className?: string;
}

export const CaseSummaryWidget: React.FC<CaseSummaryWidgetProps> = ({
  data,
  loading = false,
  onCaseClick,
  className = '',
}) => {
  const [summary, setSummary] = useState<CaseSummary>(
    data || {
      totalCases: 0,
      activeCases: 0,
      closedCases: 0,
      pendingCases: 0,
      urgentCases: 0,
      recentActivity: [],
    }
  );

  useEffect(() => {
    if (data) {
      setSummary(data);
    }
  }, [data]);

  const stats = [
    {
      label: 'Active',
      value: summary.activeCases,
      icon: FileText,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Pending',
      value: summary.pendingCases,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      label: 'Urgent',
      value: summary.urgentCases,
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
    {
      label: 'Closed',
      value: summary.closedCases,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  ];

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-20"></div>
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded h-16"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={`p-2 rounded ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Total Cases */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 mb-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Total Cases
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {summary.totalCases}
            </div>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </motion.div>

      {/* Recent Activity */}
      {summary.recentActivity.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Recent Activity
          </h4>
          <div className="space-y-2">
            {summary.recentActivity.slice(0, 3).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => onCaseClick?.(activity.id)}
                className={`bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600 ${
                  onCaseClick ? 'cursor-pointer hover:shadow-md' : ''
                } transition-shadow`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.caseNumber}
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      activity.status === 'Active'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : activity.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                  {activity.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {new Date(activity.lastUpdate).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseSummaryWidget;
