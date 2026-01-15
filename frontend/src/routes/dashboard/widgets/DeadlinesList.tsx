/**
 * @module components/dashboard/widgets/DeadlinesList
 * @category Dashboard Widgets
 * @description Upcoming deadlines list with priority indicators
 * Displays court dates, filing deadlines, and important milestones
 */

import { cn } from '@/lib/cn';
import { useTheme } from '@/contexts/ThemeContext';
import { format, formatDistanceToNow, isPast, isThisWeek, isToday, isTomorrow } from 'date-fns';
import { AlertCircle, Calendar, CheckCircle2, Clock, Flag } from 'lucide-react';
import React from 'react';
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

const getPriorityConfig = (priority: Deadline['priority'], tokens: { colors: Record<string, string> }) => {
  switch (priority) {
    case 'critical':
      return {
        color: tokens.colors.error,
        bg: `${tokens.colors.error}15`,
        border: tokens.colors.error,
        dot: tokens.colors.error,
      };
    case 'high':
      return {
        color: tokens.colors.warning,
        bg: `${tokens.colors.warning}15`,
        border: tokens.colors.warning,
        dot: tokens.colors.warning,
      };
    case 'medium':
      return {
        color: '#d97706',
        bg: '#d9770615',
        border: '#d97706',
        dot: '#d97706',
      };
    case 'low':
    default:
      return {
        color: tokens.colors.info,
        bg: `${tokens.colors.info}15`,
        border: tokens.colors.info,
        dot: tokens.colors.info,
      };
  }
};

const getStatusConfig = (status: Deadline['status'], tokens: { colors: Record<string, string> }) => {
  switch (status) {
    case 'completed':
      return {
        icon: CheckCircle2,
        color: tokens.colors.success,
        bg: `${tokens.colors.success}10`,
      };
    case 'overdue':
      return {
        icon: AlertCircle,
        color: tokens.colors.error,
        bg: `${tokens.colors.error}10`,
      };
    case 'pending':
    default:
      return {
        icon: Clock,
        color: tokens.colors.textMuted,
        bg: tokens.colors.surfaceHover,
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
  const { theme, tokens } = useTheme();

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
          <div
            key={i}
            style={{
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.borderRadius.lg
            }}
            className="flex gap-3 p-3 animate-pulse"
          >
            <div style={{ backgroundColor: tokens.colors.surfaceHover, borderRadius: tokens.borderRadius.lg }} className="w-12 h-12" />
            <div className="flex-1 space-y-2">
              <div style={{ backgroundColor: tokens.colors.surfaceHover, borderRadius: tokens.borderRadius.sm }} className="h-4 w-3/4" />
              <div style={{ backgroundColor: tokens.colors.surfaceHover, borderRadius: tokens.borderRadius.sm }} className="h-3 w-1/2" />
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
        const priorityConfig = getPriorityConfig(deadline.priority, tokens);
        const statusConfig = getStatusConfig(deadline.computedStatus, tokens);
        const StatusIcon = statusConfig.icon;
        const deadlineDate = typeof deadline.date === 'string' ? new Date(deadline.date) : deadline.date;

        return (
          <div
            key={deadline.id}
            style={{
              backgroundColor: tokens.colors.surface,
              border: `1px solid ${priorityConfig.border}`,
              borderRadius: tokens.borderRadius.lg,
              boxShadow: tokens.shadows.sm,
              opacity: deadline.computedStatus === 'completed' ? 0.6 : 1
            }}
            className={cn(
              'relative flex gap-3 p-3 transition-all duration-200',
              onDeadlineClick && 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
            )}
            onClick={() => onDeadlineClick?.(deadline)}
            role={onDeadlineClick ? 'button' : undefined}
            tabIndex={onDeadlineClick ? 0 : undefined}
          >
            {/* Date Badge */}
            <div
              style={{
                backgroundColor: priorityConfig.bg,
                borderRadius: tokens.borderRadius.lg
              }}
              className="flex-shrink-0 w-14 h-14 flex flex-col items-center justify-center"
            >
              <span style={{ color: priorityConfig.color }} className="text-xs font-semibold uppercase">
                {format(deadlineDate, 'MMM')}
              </span>
              <span style={{ color: priorityConfig.color }} className="text-xl font-bold">
                {format(deadlineDate, 'd')}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 style={{ color: tokens.colors.text }} className="text-sm font-semibold truncate">
                      {deadline.title}
                    </h4>
                    <div style={{ backgroundColor: priorityConfig.dot }} className="w-2 h-2 rounded-full flex-shrink-0" />
                  </div>
                  {deadline.description && (
                    <p style={{ color: tokens.colors.textSecondary }} className="text-xs mb-1">
                      {deadline.description}
                    </p>
                  )}
                  {deadline.caseName && (
                    <p style={{ color: tokens.colors.textMuted }} className="text-xs">
                      {deadline.caseName}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.color,
                    borderRadius: tokens.borderRadius.sm
                  }}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium whitespace-nowrap"
                >
                  <StatusIcon className="h-3 w-3" />
                  <span>{getUrgencyLabel(deadline.date)}</span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span style={{ color: tokens.colors.textMuted }} className="capitalize">
                    {deadline.type}
                  </span>
                  {deadline.assignee && (
                    <>
                      <span style={{ color: tokens.colors.textMuted }}>•</span>
                      <span style={{ color: tokens.colors.textSecondary }}>
                        {deadline.assignee.name}
                      </span>
                    </>
                  )}
                </div>
                <Flag style={{ color: priorityConfig.color }} className="h-3 w-3" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

DeadlinesList.displayName = 'DeadlinesList';
