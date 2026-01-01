/**
 * @module enterprise/dashboard/RealTimeActivityFeed
 * @category Enterprise Dashboard
 * @description Real-time activity feed with live updates and filtering
 * Displays recent activities, events, and notifications in real-time
 */

import { useTheme } from '@/providers/ThemeContext';
import type { Activity as ActivityType, ActivityType as ActivityTypeEnum, BaseDashboardProps } from '@/types/dashboard';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Filter,
  LucideIcon,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Upload,
  UserPlus,
} from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

export interface RealTimeActivityFeedProps extends BaseDashboardProps {
  activities: ActivityType[];
  maxItems?: number;
  showFilter?: boolean;
  compact?: boolean;
  onActivityClick?: (activity: ActivityType) => void;
}

const ACTIVITY_ICONS: Record<ActivityTypeEnum, LucideIcon> = {
  case_created: Briefcase,
  case_updated: FileText,
  case_closed: CheckCircle,
  document_uploaded: Upload,
  task_completed: CheckCircle,
  deadline_approaching: AlertCircle,
  payment_received: DollarSign,
  team_member_added: UserPlus,
  comment_added: MessageSquare,
  status_changed: TrendingUp,
};

const ACTIVITY_COLORS: Record<ActivityTypeEnum, string> = {
  case_created: 'text-blue-600 dark:text-blue-400',
  case_updated: 'text-indigo-600 dark:text-indigo-400',
  case_closed: 'text-emerald-600 dark:text-emerald-400',
  document_uploaded: 'text-purple-600 dark:text-purple-400',
  task_completed: 'text-green-600 dark:text-green-400',
  deadline_approaching: 'text-amber-600 dark:text-amber-400',
  payment_received: 'text-teal-600 dark:text-teal-400',
  team_member_added: 'text-cyan-600 dark:text-cyan-400',
  comment_added: 'text-pink-600 dark:text-pink-400',
  status_changed: 'text-violet-600 dark:text-violet-400',
};

const ACTIVITY_BG_COLORS: Record<ActivityTypeEnum, string> = {
  case_created: 'bg-blue-100 dark:bg-blue-900/30',
  case_updated: 'bg-indigo-100 dark:bg-indigo-900/30',
  case_closed: 'bg-emerald-100 dark:bg-emerald-900/30',
  document_uploaded: 'bg-purple-100 dark:bg-purple-900/30',
  task_completed: 'bg-green-100 dark:bg-green-900/30',
  deadline_approaching: 'bg-amber-100 dark:bg-amber-900/30',
  payment_received: 'bg-teal-100 dark:bg-teal-900/30',
  team_member_added: 'bg-cyan-100 dark:bg-cyan-900/30',
  comment_added: 'bg-pink-100 dark:bg-pink-900/30',
  status_changed: 'bg-violet-100 dark:bg-violet-900/30',
};

/**
 * RealTimeActivityFeed - Live activity feed component
 * Displays real-time updates of system activities
 */
export const RealTimeActivityFeed: React.FC<RealTimeActivityFeedProps> = ({
  activities,
  maxItems = 10,
  showFilter = true,
  compact = false,
  className,
  isLoading = false,
  error,
  onRefresh,
  autoRefresh = false,
  refreshInterval = 30000,
  onActivityClick,
}) => {
  const { theme } = useTheme();
  const [filterType, setFilterType] = useState<ActivityTypeEnum | 'all'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastUpdate(new Date());
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    if (autoRefresh && onRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, refreshInterval);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, onRefresh, refreshInterval, isRefreshing]);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    if (filterType !== 'all') {
      filtered = activities.filter((activity) => activity.type === filterType);
    }
    return filtered.slice(0, maxItems);
  }, [activities, filterType, maxItems]);

  const getTimeAgo = (timestamp: Date | string): string => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getActivityIcon = (activity: ActivityType) => {
    if (activity.icon) return activity.icon;
    return ACTIVITY_ICONS[activity.type] || Activity;
  };

  const getActivityColor = (activity: ActivityType) => {
    if (activity.color) return activity.color;
    return ACTIVITY_COLORS[activity.type] || theme.text.primary;
  };

  const getActivityBgColor = (activity: ActivityType) => {
    return ACTIVITY_BG_COLORS[activity.type] || 'bg-gray-100 dark:bg-gray-800';
  };

  const getPriorityIndicator = (priority?: string) => {
    switch (priority) {
      case 'critical':
        return <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />;
      case 'high':
        return <div className="w-2 h-2 rounded-full bg-amber-500" />;
      case 'medium':
        return <div className="w-2 h-2 rounded-full bg-blue-500" />;
      case 'low':
        return <div className="w-2 h-2 rounded-full bg-gray-400" />;
      default:
        return null;
    }
  };

  if (error?.hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'p-6 rounded-xl border',
          'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
          <div>
            <h3 className="font-bold text-rose-900 dark:text-rose-100">
              Failed to Load Activity Feed
            </h3>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border shadow-sm',
        theme.surface.default,
        theme.border.default,
        className
      )}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className={cn('text-lg font-bold', theme.text.primary)}>
              Real-Time Activity
            </h3>
            <p className={cn('text-xs mt-1 flex items-center gap-1', theme.text.tertiary)}>
              <Clock className="h-3 w-3" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showFilter && (
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as ActivityTypeEnum | 'all')}
                  className={cn(
                    'pl-8 pr-3 py-2 text-sm rounded-lg border appearance-none cursor-pointer',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500',
                    theme.surface.raised,
                    theme.border.default,
                    theme.text.primary
                  )}
                >
                  <option value="all">All Activities</option>
                  <option value="case_created">Cases Created</option>
                  <option value="case_updated">Cases Updated</option>
                  <option value="case_closed">Cases Closed</option>
                  <option value="document_uploaded">Documents</option>
                  <option value="task_completed">Tasks</option>
                  <option value="payment_received">Payments</option>
                </select>
                <Filter className={cn('absolute left-2.5 top-2.5 h-4 w-4 pointer-events-none', theme.text.tertiary)} />
              </div>
            )}
            {onRefresh && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || isLoading}
                className={cn(
                  'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors',
                  (isRefreshing || isLoading) && 'opacity-50 cursor-not-allowed'
                )}
                aria-label="Refresh activities"
              >
                <RefreshCw
                  className={cn(
                    'h-5 w-5',
                    (isRefreshing || isLoading) && 'animate-spin',
                    theme.text.secondary
                  )}
                />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="p-6">
        {isLoading && filteredActivities.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Activity className={cn('h-12 w-12 mx-auto mb-3', theme.text.tertiary)} />
            <p className={cn('text-sm font-medium', theme.text.secondary)}>
              No activities to display
            </p>
            <p className={cn('text-xs mt-1', theme.text.tertiary)}>
              {filterType !== 'all' ? 'Try changing the filter' : 'Activities will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity);
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => onActivityClick?.(activity)}
                    className={cn(
                      'p-4 rounded-lg border transition-all',
                      theme.surface.raised,
                      theme.border.default,
                      'hover:border-blue-300 dark:hover:border-blue-700',
                      onActivityClick && 'cursor-pointer',
                      compact && 'p-3'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn('p-2 rounded-lg flex-shrink-0', getActivityBgColor(activity))}>
                        <Icon className={cn('h-4 w-4', getActivityColor(activity))} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className={cn('text-sm font-medium', theme.text.primary)}>
                            {activity.title}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {getPriorityIndicator(activity.priority)}
                            <span className={cn('text-xs whitespace-nowrap', theme.text.tertiary)}>
                              {getTimeAgo(activity.timestamp)}
                            </span>
                          </div>
                        </div>
                        <p className={cn('text-xs line-clamp-2', theme.text.secondary)}>
                          {activity.description}
                        </p>
                        {activity.user && (
                          <div className="flex items-center gap-2 mt-2">
                            {activity.user.avatar ? (
                              <img
                                src={activity.user.avatar}
                                alt={activity.user.name}
                                className="w-5 h-5 rounded-full"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                                {activity.user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className={cn('text-xs', theme.text.tertiary)}>
                              {activity.user.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer - Activity Count */}
      {filteredActivities.length > 0 && (
        <div className={cn('px-6 py-3 border-t text-center', theme.border.default)}>
          <p className={cn('text-xs', theme.text.tertiary)}>
            Showing {filteredActivities.length} of {activities.length} activities
          </p>
        </div>
      )}
    </motion.div>
  );
};
