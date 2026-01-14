/**
 * @module components/dashboard/widgets/ActivityFeed
 * @category Dashboard Widgets
 * @description Recent activity feed with timeline view
 * Displays case updates, document uploads, tasks completed, and system events
 */

import { useTheme } from '@/theme';
import { Activity, ActivityType } from '@/types/dashboard';
import { cn } from '@/shared/lib/cn';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertTriangle,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  LucideIcon,
  MessageSquare,
  Upload,
  UserPlus,
} from 'lucide-react';
// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface ActivityFeedProps {
  /** Activity items */
  activities: Activity[];
  /** Loading state */
  isLoading?: boolean;
  /** Maximum items to display */
  maxItems?: number;
  /** Show user avatars */
  showAvatars?: boolean;
  /** Click handler for activity item */
  onActivityClick?: (activity: Activity) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  case_created: {
    icon: Briefcase,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  case_updated: {
    icon: Briefcase,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
  },
  case_closed: {
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  document_uploaded: {
    icon: Upload,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  task_completed: {
    icon: CheckCircle2,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  deadline_approaching: {
    icon: Clock,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
  },
  payment_received: {
    icon: DollarSign,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  team_member_added: {
    icon: UserPlus,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/30',
  },
  status_changed: {
    icon: AlertTriangle,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
};

const formatTimestamp = (timestamp: Date | string): string => {
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
};

const getPriorityColor = (priority?: Activity['priority']): string => {
  switch (priority) {
    case 'critical':
      return 'border-l-red-500 dark:border-l-red-400';
    case 'high':
      return 'border-l-orange-500 dark:border-l-orange-400';
    case 'medium':
      return 'border-l-yellow-500 dark:border-l-yellow-400';
    case 'low':
    default:
      return 'border-l-gray-300 dark:border-l-gray-600';
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  isLoading = false,
  maxItems = 10,
  showAvatars = true,
  onActivityClick,
  emptyMessage = 'No recent activity',
  className,
}) => {
  const { theme } = useTheme();

  const displayActivities = activities.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayActivities.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <FileText className={cn('h-12 w-12 mx-auto mb-3', theme.text.tertiary)} />
        <p className={cn('text-sm', theme.text.tertiary)}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {displayActivities.map((activity, index) => {
        const config = activityConfig[activity.type] || activityConfig.status_changed;
        const Icon = activity.icon || config.icon;

        return (
          <div
            key={activity.id}
            className={cn(
              'relative flex gap-3 p-3 rounded-lg border-l-4 transition-all duration-200',
              theme.surface.default,
              getPriorityColor(activity.priority),
              onActivityClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50',
              index < displayActivities.length - 1 && 'border-b border-gray-100 dark:border-gray-800'
            )}
            onClick={() => onActivityClick?.(activity)}
            role={onActivityClick ? 'button' : undefined}
            tabIndex={onActivityClick ? 0 : undefined}
          >
            {/* Icon or Avatar */}
            <div className={cn('flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center', config.bgColor)}>
              {showAvatars && activity.user?.avatar ? (
                <img
                  src={activity.user.avatar}
                  alt={activity.user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <Icon className={cn('h-5 w-5', config.color)} />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={cn('text-sm font-medium', theme.text.primary)}>
                  {activity.title}
                </p>
                <time className={cn('text-xs whitespace-nowrap', theme.text.tertiary)}>
                  {formatTimestamp(activity.timestamp)}
                </time>
              </div>
              <p className={cn('text-sm mb-1', theme.text.secondary)}>
                {activity.description}
              </p>
              {activity.user && (
                <p className={cn('text-xs', theme.text.tertiary)}>
                  by {activity.user.name}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

ActivityFeed.displayName = 'ActivityFeed';
