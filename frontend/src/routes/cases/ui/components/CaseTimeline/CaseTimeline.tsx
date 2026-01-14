/**
 * CaseTimeline Component
 *
 * Displays a chronological timeline of case events and activities.
 * Shows filings, hearings, deadlines, and other significant case milestones.
 *
 * @module components/features/cases/CaseTimeline
 */

import { cn } from '@/shared/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

export interface TimelineEvent {
  id: string;
  type: 'filing' | 'hearing' | 'deadline' | 'document' | 'note' | 'motion' | 'order' | 'other';
  title: string;
  description?: string;
  date: string;
  user?: string;
  metadata?: Record<string, unknown>;
}

export interface CaseTimelineProps {
  /** Array of timeline events */
  events: TimelineEvent[];
  /** Show filters for event types */
  showFilters?: boolean;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * Event type configuration with colors and icons
 */
const EVENT_CONFIG: Record<TimelineEvent['type'], {
  icon: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
}> = {
  filing: {
    icon: '📄',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  hearing: {
    icon: '⚖️',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  deadline: {
    icon: '⏰',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700',
    iconColor: 'text-red-600 dark:text-red-400',
  },
  document: {
    icon: '📁',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  note: {
    icon: '📝',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
    iconColor: 'text-yellow-600 dark:text-yellow-400',
  },
  motion: {
    icon: '⚡',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  order: {
    icon: '📋',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  other: {
    icon: '•',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-300 dark:border-gray-700',
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
};

/**
 * Format date for display
 */
function formatEventDate(date: string): string {
  try {
    const eventDate = new Date(date);
    const isToday = new Date().toDateString() === eventDate.toDateString();

    if (isToday) {
      return `Today at ${format(eventDate, 'h:mm a')}`;
    }

    return format(eventDate, 'MMM d, yyyy');
  } catch {
    return 'Invalid date';
  }
}

/**
 * Get relative time for tooltip
 */
function getRelativeTime(date: string): string {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return '';
  }
}

/**
 * Group events by date
 */
function groupEventsByDate(events: TimelineEvent[]): Map<string, TimelineEvent[]> {
  const grouped = new Map<string, TimelineEvent[]>();

  events.forEach(event => {
    try {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, event]);
    } catch {
      // Skip invalid dates
    }
  });

  return grouped;
}

/**
 * CaseTimeline component displays chronological case events
 */
export function CaseTimeline({
  events,
  showFilters = false,
  className,
}: CaseTimelineProps) {
  // Sort events by date (newest first)
  const sortedEvents = [...events].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const groupedEvents = groupEventsByDate(sortedEvents);

  // Log grouped events for debugging
  console.log('Grouped timeline events:', groupedEvents);

  if (events.length === 0) {
    return (
      <div className={cn('rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800/50', className)}>
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No timeline events</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Case events and milestones will appear here as they occur.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Filters (if enabled) */}
      {showFilters && (
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
            All Events
          </button>
          <button className="rounded-lg border border-transparent bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            Filings
          </button>
          <button className="rounded-lg border border-transparent bg-purple-50 px-3 py-1.5 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            Hearings
          </button>
          <button className="rounded-lg border border-transparent bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Deadlines
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Events */}
        <div className="space-y-6">
          {sortedEvents.map((event, index) => {
            const config = EVENT_CONFIG[event.type];
            const isLast = index === sortedEvents.length - 1;

            return (
              <div key={event.id} className="relative pl-10">
                {/* Icon */}
                <div
                  className={cn(
                    'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full border-2',
                    config.bgColor,
                    config.borderColor
                  )}
                >
                  <span className="text-sm" aria-hidden="true">{config.icon}</span>
                </div>

                {/* Content */}
                <div
                  className={cn(
                    'rounded-lg border bg-white p-4 shadow-sm dark:bg-gray-800 dark:border-gray-700',
                    !isLast && 'mb-6'
                  )}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          {event.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={cn(
                        'flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium',
                        config.bgColor,
                        config.iconColor
                      )}
                    >
                      {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-4">
                      <span title={getRelativeTime(event.date)}>
                        {formatEventDate(event.date)}
                      </span>
                      {event.user && (
                        <>
                          <span>•</span>
                          <span>{event.user}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Metadata (if present) */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-gray-200 pt-3 text-xs dark:border-gray-700">
                      {Object.entries(event.metadata).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {key}:
                          </span>
                          <span className="text-gray-600 dark:text-gray-400">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
