/**
 * @module enterprise/ui/ActivityFeed
 * @category Enterprise UI
 * @description Real-time activity feed component with filtering and virtualization
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  FileText,
  Filter,
  MessageSquare,
  Trash2,
  Upload,
  Users,
  XCircle,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
import { Button } from '@/components/ui/atoms/Button/Button';
import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/utils/cn';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type ActivityType =
  | 'create'
  | 'update'
  | 'delete'
  | 'upload'
  | 'download'
  | 'comment'
  | 'assign'
  | 'complete'
  | 'cancel'
  | 'other';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  maxHeight?: number;
  showFilter?: boolean;
  onItemClick?: (activity: ActivityItem) => void;
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

const getActivityIcon = (type: ActivityType): React.ElementType => {
  const iconMap: Record<ActivityType, React.ElementType> = {
    create: FileText,
    update: Edit,
    delete: Trash2,
    upload: Upload,
    download: Download,
    comment: MessageSquare,
    assign: Users,
    complete: CheckCircle2,
    cancel: XCircle,
    other: Activity,
  };
  return iconMap[type] || Activity;
};

const getActivityColor = (type: ActivityType): string => {
  const colorMap: Record<ActivityType, string> = {
    create: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    update: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30',
    delete: 'text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30',
    upload: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30',
    download: 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30',
    comment: 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30',
    assign: 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30',
    complete: 'text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30',
    cancel: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
    other: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
  };
  return colorMap[type] || colorMap.other;
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxHeight = 600,
  showFilter = true,
  onItemClick,
  emptyMessage = 'No recent activity',
  className,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [selectedTypes, setSelectedTypes] = useState<Set<ActivityType>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (selectedTypes.size === 0) return activities;
    return activities.filter((activity) => selectedTypes.has(activity.type));
  }, [activities, selectedTypes]);

  // Get unique activity types
  const activityTypes = useMemo(() => {
    const types = new Set<ActivityType>();
    activities.forEach((activity) => types.add(activity.type));
    return Array.from(types);
  }, [activities]);

  const toggleType = (type: ActivityType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  return (
    <div className={cn('flex flex-col rounded-xl border', theme.surface.default, theme.border.default, className)}>
      {/* Header */}
      <div className={cn('flex items-center justify-between px-6 py-4 border-b', theme.border.default)}>
        <div className="flex items-center gap-2">
          <Activity className={cn('h-5 w-5', theme.text.secondary)} />
          <h3 className={cn('text-lg font-semibold', theme.text.primary)}>
            Activity Feed
          </h3>
        </div>

        {showFilter && activityTypes.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={Filter}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter {selectedTypes.size > 0 && `(${selectedTypes.size})`}
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn('border-b overflow-hidden', theme.border.default)}
          >
            <div className="p-4">
              <p className={cn('text-xs font-medium mb-3', theme.text.secondary)}>
                Filter by activity type
              </p>
              <div className="flex flex-wrap gap-2">
                {activityTypes.map((type) => {
                  const Icon = getActivityIcon(type);
                  const isSelected = selectedTypes.has(type);

                  return (
                    <button
                      key={type}
                      onClick={() => toggleType(type)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all',
                        isSelected
                          ? getActivityColor(type) + ' border-current'
                          : theme.surface.highlight + ' ' + theme.border.default + ' ' + theme.text.secondary
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  );
                })}
              </div>
              {selectedTypes.size > 0 && (
                <button
                  onClick={() => setSelectedTypes(new Set())}
                  className={cn('mt-3 text-xs font-medium hover:underline', theme.text.tertiary)}
                >
                  Clear filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity List */}
      <div
        className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
        style={{ maxHeight }}
      >
        {loading ? (
          <div className={cn('flex items-center justify-center py-12', theme.text.tertiary)}>
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className={cn('flex flex-col items-center justify-center py-12 px-6', theme.text.tertiary)}>
            <Clock className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">{emptyMessage}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className={cn('absolute left-[2.125rem] top-0 bottom-0 w-px', theme.border.default)} />

            {/* Activity items */}
            <div className="space-y-0">
              <AnimatePresence mode="popLayout">
                {filteredActivities.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type);
                  const isLast = index === filteredActivities.length - 1;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      onClick={() => onItemClick?.(activity)}
                      className={cn(
                        'relative flex items-start gap-4 px-6 py-4 transition-colors',
                        onItemClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50',
                        !isLast && 'border-b ' + theme.border.default
                      )}
                    >
                      {/* Icon */}
                      <div className={cn('relative z-10 flex items-center justify-center h-9 w-9 rounded-full flex-shrink-0', colorClass)}>
                        <Icon className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <p className={cn('text-sm', theme.text.primary)}>
                            <span className="font-semibold">{activity.user.name}</span>{' '}
                            {activity.action}
                            {activity.target && (
                              <>
                                {' '}
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {activity.target}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <p className={cn('text-xs flex items-center gap-1.5', theme.text.tertiary)}>
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(activity.timestamp)}
                        </p>

                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className={cn('mt-2 p-2 rounded-lg text-xs', theme.surface.highlight)}>
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <div key={key} className="flex items-center gap-2">
                                <span className={theme.text.tertiary}>{key}:</span>
                                <span className={theme.text.secondary}>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && filteredActivities.length > 0 && (
        <div className={cn('px-6 py-3 border-t text-xs', theme.border.default, theme.text.tertiary)}>
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
      )}
    </div>
  );
};

ActivityFeed.displayName = 'ActivityFeed';
export default ActivityFeed;
