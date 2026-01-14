/**
 * @module components/dashboard/widgets/DeadlinesList
 * @category Dashboard Widgets
 * @description Upcoming deadlines list with priority indicators
 * Displays court dates, filing deadlines, and important milestones
 */

import { useTheme } from '@/theme';
import { cn } from '@/shared/lib/cn';
import { format, formatDistanceToNow, isPast, isThisWeek, isToday, isTomorrow } from 'date-fns';
import { AlertCircle, Calendar, CheckCircle2, Clock, Flag } from 'lucide-react';
// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  date: Date | string;
  caseId?: string;
  caseName?: string;
  type: 'filing' | 'hearing' | 'meeting' | 'milestone' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status?: 'pending' | 'completed' | 'overdue';
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export interface DeadlinesListProps {
  /** Deadline items */
  deadlines: Deadline[];
  /** Loading state */
  isLoading?: boolean;
  /** Maximum items to display */
  maxItems?: number;
  /** Show completed deadlines */
  showCompleted?: boolean;
  /** Click handler for deadline item */
  onDeadlineClick?: (deadline: Deadline) => void;
  /** Empty state message */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

const getDeadlineStatus = (date: Date | string, currentStatus?: Deadline['status']): Deadline['status'] => {
  if (currentStatus === 'completed') return 'completed';
  const deadlineDate = typeof date === 'string' ? new Date(date) : date;
  return isPast(deadlineDate) ? 'overdue' : 'pending';
};

const getUrgencyLabel = (date: Date | string): string => {
  const deadlineDate = typeof date === 'string' ? new Date(date) : date;

  if (isToday(deadlineDate)) return 'Today';
  if (isTomorrow(deadlineDate)) return 'Tomorrow';
  if (isThisWeek(deadlineDate)) return 'This Week';
  if (isPast(deadlineDate)) return 'Overdue';

  return formatDistanceToNow(deadlineDate, { addSuffix: true });
};

const getPriorityConfig = (priority: Deadline['priority']) => {
  switch (priority) {
    case 'critical':
      return {
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-100 dark:bg-red-900/30',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-500',
      };
    case 'high':
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        border: 'border-orange-200 dark:border-orange-800',
        dot: 'bg-orange-500',
      };
    case 'medium':
      return {
        color: 'text-yellow-600 dark:text-yellow-400',
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        border: 'border-yellow-200 dark:border-yellow-800',
        dot: 'bg-yellow-500',
      };
    case 'low':
    default:
      return {
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
      };
  }
};

const getStatusConfig = (status: Deadline['status']) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle2,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      };
    case 'overdue':
      return {
        icon: AlertCircle,
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950/20',
      };
    case 'pending':
    default:
      return {
        icon: Clock,
        color: 'text-gray-600 dark:text-gray-400',
        bg: 'bg-gray-50 dark:bg-gray-950/20',
      };
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export const DeadlinesList: React.FC<DeadlinesListProps> = ({
  deadlines,
  isLoading = false,
  maxItems = 10,
  showCompleted = false,
  onDeadlineClick,
  emptyMessage = 'No upcoming deadlines',
  className,
}) => {
  const { theme } = useTheme();

  // Filter and sort deadlines
  const filteredDeadlines = React.useMemo(() => {
    let items = deadlines.map(deadline => ({
      ...deadline,
      computedStatus: getDeadlineStatus(deadline.date, deadline.status),
    }));

    if (!showCompleted) {
      items = items.filter(d => d.computedStatus !== 'completed');
    }

    // Sort by date (earliest first), then by priority
    items.sort((a, b) => {
      const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
      const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
      const dateDiff = dateA.getTime() - dateB.getTime();

      if (dateDiff !== 0) return dateDiff;

      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return items.slice(0, maxItems);
  }, [deadlines, showCompleted, maxItems]);

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredDeadlines.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Calendar className={cn('h-12 w-12 mx-auto mb-3', theme.text.tertiary)} />
        <p className={cn('text-sm', theme.text.tertiary)}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {filteredDeadlines.map((deadline) => {
        const priorityConfig = getPriorityConfig(deadline.priority);
        const statusConfig = getStatusConfig(deadline.computedStatus);
        const StatusIcon = statusConfig.icon;
        const deadlineDate = typeof deadline.date === 'string' ? new Date(deadline.date) : deadline.date;

        return (
          <div
            key={deadline.id}
            className={cn(
              'relative flex gap-3 p-3 rounded-lg border transition-all duration-200',
              theme.surface.default,
              priorityConfig.border,
              deadline.computedStatus === 'completed' && 'opacity-60',
              onDeadlineClick && 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
            )}
            onClick={() => onDeadlineClick?.(deadline)}
            role={onDeadlineClick ? 'button' : undefined}
            tabIndex={onDeadlineClick ? 0 : undefined}
          >
            {/* Date Badge */}
            <div className={cn('flex-shrink-0 w-14 h-14 rounded-lg flex flex-col items-center justify-center', priorityConfig.bg)}>
              <span className={cn('text-xs font-semibold uppercase', priorityConfig.color)}>
                {format(deadlineDate, 'MMM')}
              </span>
              <span className={cn('text-xl font-bold', priorityConfig.color)}>
                {format(deadlineDate, 'd')}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn('text-sm font-semibold truncate', theme.text.primary)}>
                      {deadline.title}
                    </h4>
                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityConfig.dot)} />
                  </div>
                  {deadline.description && (
                    <p className={cn('text-xs mb-1', theme.text.secondary)}>
                      {deadline.description}
                    </p>
                  )}
                  {deadline.caseName && (
                    <p className={cn('text-xs', theme.text.tertiary)}>
                      {deadline.caseName}
                    </p>
                  )}
                </div>
                <div className={cn('flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap', statusConfig.bg, statusConfig.color)}>
                  <StatusIcon className="h-3 w-3" />
                  <span>{getUrgencyLabel(deadline.date)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className={cn('capitalize', theme.text.tertiary)}>
                    {deadline.type}
                  </span>
                  {deadline.assignee && (
                    <>
                      <span className={theme.text.tertiary}>•</span>
                      <span className={theme.text.secondary}>
                        {deadline.assignee.name}
                      </span>
                    </>
                  )}
                </div>
                <Flag className={cn('h-3 w-3', priorityConfig.color)} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

DeadlinesList.displayName = 'DeadlinesList';
