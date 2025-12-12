import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  MessageCircle,
  UserPlus,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  LucideIcon,
} from 'lucide-react';

export interface Activity {
  id: string;
  type: 'case' | 'comment' | 'user' | 'billing' | 'event' | 'task' | 'alert' | 'update';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: Record<string, any>;
}

export interface RecentActivityWidgetProps {
  activities?: Activity[];
  limit?: number;
  onActivityClick?: (activity: Activity) => void;
  loading?: boolean;
  className?: string;
}

const activityIcons: Record<Activity['type'], LucideIcon> = {
  case: FileText,
  comment: MessageCircle,
  user: UserPlus,
  billing: DollarSign,
  event: Calendar,
  task: CheckCircle,
  alert: AlertCircle,
  update: TrendingUp,
};

const activityColors: Record<Activity['type'], string> = {
  case: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  comment: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  user: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  billing: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  event: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  task: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
  alert: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  update: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
};

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  activities = [],
  limit = 10,
  onActivityClick,
  loading = false,
  className = '',
}) => {
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`space-y-3 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="animate-pulse flex gap-3">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
              <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
              <div className="w-1/4 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const displayActivities = activities.slice(0, limit);

  if (displayActivities.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-400 dark:text-gray-600 mb-2">
          <TrendingUp className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {displayActivities.map((activity, index) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onActivityClick?.(activity)}
            className={`flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 ${
              onActivityClick ? 'cursor-pointer hover:shadow-md' : ''
            } transition-all`}
          >
            {/* Icon */}
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {activity.title}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {activity.description}
              </p>
              {activity.user && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  by {activity.user}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}

      {activities.length > limit && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: displayActivities.length * 0.05 }}
          className="text-center pt-2"
        >
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            View all {activities.length} activities
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default RecentActivityWidget;
