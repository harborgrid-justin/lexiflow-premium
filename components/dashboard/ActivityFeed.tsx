import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock
} from 'lucide-react';

interface Activity {
  id: string;
  type: 'case' | 'client' | 'event' | 'task' | 'alert' | 'message';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
}

interface ActivityFeedProps {
  maxItems?: number;
  showFilter?: boolean;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  maxItems = 10,
  showFilter = true,
  className = ''
}) => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'case',
      title: 'New Case Filed',
      description: 'Smith v. Johnson - Contract Dispute',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      user: 'John Doe',
      status: 'success'
    },
    {
      id: '2',
      type: 'task',
      title: 'Task Completed',
      description: 'Discovery documents reviewed and filed',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      user: 'Jane Smith',
      status: 'success'
    },
    {
      id: '3',
      type: 'event',
      title: 'Upcoming Hearing',
      description: 'Court hearing scheduled for Case #2023-456',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      status: 'warning'
    },
    {
      id: '4',
      type: 'client',
      title: 'New Client Added',
      description: 'Acme Corporation - Corporate Law',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      user: 'Mike Johnson',
      status: 'info'
    },
    {
      id: '5',
      type: 'alert',
      title: 'Deadline Approaching',
      description: 'Motion to dismiss due in 2 days',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
      status: 'error'
    }
  ]);

  const [filter, setFilter] = useState<string>('all');

  const getIcon = (type: Activity['type']) => {
    switch (type) {
      case 'case':
        return <FileText className="w-5 h-5" />;
      case 'client':
        return <User className="w-5 h-5" />;
      case 'event':
        return <Calendar className="w-5 h-5" />;
      case 'task':
        return <CheckCircle className="w-5 h-5" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status?: Activity['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredActivities = activities
    .filter((activity) => filter === 'all' || activity.type === filter)
    .slice(0, maxItems);

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 ${className}`}
      role="region"
      aria-label="Activity Feed"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <Clock className="w-5 h-5 text-gray-400" />
        </div>

        {/* Filter */}
        {showFilter && (
          <div className="flex flex-wrap gap-2" role="tablist">
            {['all', 'case', 'client', 'event', 'task', 'alert'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType)}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  filter === filterType
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                role="tab"
                aria-selected={filter === filterType}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <AnimatePresence mode="popLayout">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50"
              tabIndex={0}
              role="article"
              aria-label={`${activity.title}: ${activity.description}`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={`flex-shrink-0 p-2.5 rounded-lg ${getStatusColor(
                    activity.status
                  )}`}
                >
                  {getIcon(activity.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {activity.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {activity.description}
                  </p>
                  {activity.user && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                      <User className="w-3 h-3" />
                      <span>{activity.user}</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredActivities.length === 0 && (
          <div className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No activities found</p>
          </div>
        )}
      </div>

      {/* View All */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="View all activities"
        >
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;
