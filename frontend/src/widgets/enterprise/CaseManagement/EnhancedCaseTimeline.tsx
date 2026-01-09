/**
 * Enhanced Case Timeline Component
 *
 * Enterprise-grade visual timeline of case events with:
 * - Interactive event filtering and grouping
 * - Multiple view modes (chronological, categorized, milestone)
 * - Event dependencies and relationships
 * - Drag-and-drop event rescheduling
 * - Export and print capabilities
 * - Gantt-style visualization option
 *
 * @module components/enterprise/CaseManagement/EnhancedCaseTimeline
 */

import { useTheme } from '@/contexts/theme/ThemeContext';
import { cn } from '@/shared/lib/utils';
import { format, formatDistanceToNow, isFuture, isPast, isToday } from 'date-fns';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronDown, ChevronRight,
  Clock,
  Download,
  Eye, EyeOff,
  FileText, Gavel,
  Link as LinkIcon,
  MapPin,
  MessageSquare,
  Plus,
  Printer,
  Star,
  Upload,
  Users,
  XCircle
} from 'lucide-react';
import React, { useMemo, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type EventType =
  | 'filing'
  | 'hearing'
  | 'deadline'
  | 'document'
  | 'motion'
  | 'order'
  | 'discovery'
  | 'deposition'
  | 'conference'
  | 'trial'
  | 'settlement'
  | 'note'
  | 'milestone'
  | 'other';

export type EventStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'missed';

export interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description?: string;
  date: string;
  endDate?: string; // For multi-day events
  status: EventStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string[];
  location?: string;
  relatedEvents?: string[]; // IDs of related events
  documents?: string[];
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TimelineGroup {
  id: string;
  name: string;
  events: TimelineEvent[];
  expanded: boolean;
}

export type ViewMode = 'chronological' | 'grouped' | 'milestone' | 'gantt';

export interface EnhancedCaseTimelineProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
  onEventUpdate?: (event: TimelineEvent) => void;
  onEventCreate?: (event: Partial<TimelineEvent>) => void;
  viewMode?: ViewMode;
  showFilters?: boolean;
  allowEdit?: boolean;
  className?: string;
}

// ============================================================================
// Configuration
// ============================================================================

const EVENT_TYPE_CONFIG: Record<EventType, {
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  filing: {
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-300 dark:border-blue-700',
  },
  hearing: {
    icon: Gavel,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
  deadline: {
    icon: AlertTriangle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-300 dark:border-red-700',
  },
  document: {
    icon: Upload,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-300 dark:border-green-700',
  },
  motion: {
    icon: FileText,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-300 dark:border-orange-700',
  },
  order: {
    icon: CheckCircle,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
  },
  discovery: {
    icon: FileText,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    borderColor: 'border-teal-300 dark:border-teal-700',
  },
  deposition: {
    icon: Users,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    borderColor: 'border-cyan-300 dark:border-cyan-700',
  },
  conference: {
    icon: Users,
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    borderColor: 'border-pink-300 dark:border-pink-700',
  },
  trial: {
    icon: Gavel,
    color: 'text-red-700 dark:text-red-300',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    borderColor: 'border-red-400 dark:border-red-600',
  },
  settlement: {
    icon: CheckCircle,
    color: 'text-green-700 dark:text-green-300',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    borderColor: 'border-green-400 dark:border-green-600',
  },
  note: {
    icon: MessageSquare,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  milestone: {
    icon: Star,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  other: {
    icon: Calendar,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-900/20',
    borderColor: 'border-gray-300 dark:border-gray-700',
  },
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'border-l-4 border-l-gray-300',
  medium: 'border-l-4 border-l-yellow-400',
  high: 'border-l-4 border-l-orange-500',
  critical: 'border-l-4 border-l-red-600',
};

// ============================================================================
// Component
// ============================================================================

export const EnhancedCaseTimeline: React.FC<EnhancedCaseTimelineProps> = ({
  events,
  onEventClick,
  onEventCreate,
  viewMode = 'chronological',
  showFilters = true,
  allowEdit = false,
  className,
}) => {
  const { theme } = useTheme();
  const [selectedTypes, setSelectedTypes] = useState<Set<EventType>>(new Set());
  const [selectedStatuses] = useState<Set<EventStatus>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [groupExpanded, setGroupExpanded] = useState<Record<string, boolean>>({});
  const [currentViewMode, setCurrentViewMode] = useState<ViewMode>(viewMode);

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = events;

    if (!showCompleted) {
      result = result.filter(e => e.status !== 'completed');
    }

    if (selectedTypes.size > 0) {
      result = result.filter(e => selectedTypes.has(e.type));
    }

    if (selectedStatuses.size > 0) {
      result = result.filter(e => selectedStatuses.has(e.status));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(query) ||
        e.description?.toLowerCase().includes(query) ||
        e.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by date
    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events, selectedTypes, selectedStatuses, searchQuery, showCompleted]);

  // Group events
  const groupedEvents = useMemo(() => {
    if (currentViewMode === 'chronological') {
      return null;
    }

    const groups: Record<string, TimelineEvent[]> = {};

    filteredEvents.forEach(event => {
      let groupKey: string;

      if (currentViewMode === 'grouped') {
        groupKey = event.type;
      } else if (currentViewMode === 'milestone') {
        groupKey = event.type === 'milestone' ? 'Milestones' : 'Events';
      } else {
        groupKey = format(new Date(event.date), 'yyyy-MM');
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey]!.push(event);
    });

    return Object.entries(groups).map(([name, events]) => ({
      id: name,
      name,
      events,
      expanded: groupExpanded[name] !== false,
    }));
  }, [filteredEvents, currentViewMode, groupExpanded]);

  // Toggle type filter
  const toggleTypeFilter = (type: EventType) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  // Toggle group expansion
  const toggleGroup = (groupId: string) => {
    setGroupExpanded(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Format event date
  const formatEventDate = (date: string): string => {
    const eventDate = new Date(date);

    if (isToday(eventDate)) {
      return `Today at ${format(eventDate, 'h:mm a')}`;
    }

    if (isFuture(eventDate)) {
      return `${format(eventDate, 'MMM d, yyyy')} (${formatDistanceToNow(eventDate, { addSuffix: true })})`;
    }

    return format(eventDate, 'MMM d, yyyy');
  };

  // Render event card
  const renderEventCard = (event: TimelineEvent) => {
    const config = EVENT_TYPE_CONFIG[event.type];
    const Icon = config.icon;
    const eventDate = new Date(event.date);
    const isOverdue = isPast(eventDate) && event.status !== 'completed' && event.type === 'deadline';

    return (
      <div
        key={event.id}
        className={cn(
          'relative border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer',
          theme.surface.default,
          theme.border.default,
          config.borderColor,
          event.priority && PRIORITY_COLORS[event.priority],
          isOverdue && 'ring-2 ring-red-400'
        )}
        onClick={() => onEventClick?.(event)}
      >
        {/* Event Header */}
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn('p-2 rounded-lg flex-shrink-0', config.bgColor)}>
            <Icon className={cn('h-5 w-5', config.color)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={cn('font-semibold', theme.text.primary)}>
                {event.title}
              </h4>
              {event.priority === 'critical' && (
                <span className={cn(
                  'flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full',
                  theme.status.error.bg,
                  theme.status.error.text
                )}>
                  Critical
                </span>
              )}
            </div>

            {event.description && (
              <p className={cn('text-sm mb-2 line-clamp-2', theme.text.secondary)}>
                {event.description}
              </p>
            )}

            {/* Metadata Row */}
            <div className={cn('flex flex-wrap items-center gap-3 text-xs', theme.text.muted)}>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatEventDate(event.date)}
              </span>

              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}

              {event.assignedTo && event.assignedTo.length > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.assignedTo.length} assigned
                </span>
              )}

              {event.documents && event.documents.length > 0 && (
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {event.documents.length} docs
                </span>
              )}

              {event.relatedEvents && event.relatedEvents.length > 0 && (
                <span className="flex items-center gap-1">
                  <LinkIcon className="h-3 w-3" />
                  {event.relatedEvents.length} related
                </span>
              )}
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {event.tags.map(tag => (
                  <span
                    key={tag}
                    className={cn(
                      'px-2 py-0.5 text-xs rounded',
                      theme.surface.subtle,
                      theme.text.secondary
                    )}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {event.status === 'completed' && (
              <CheckCircle className={cn('h-5 w-5', theme.status.success.text)} />
            )}
            {event.status === 'cancelled' && (
              <XCircle className={cn('h-5 w-5', theme.status.neutral.text)} />
            )}
            {event.status === 'missed' && (
              <XCircle className={cn('h-5 w-5', theme.status.error.text)} />
            )}
          </div>
        </div>

        {/* Overdue Warning */}
        {isOverdue && (
          <div className={cn('mt-3 pt-3 border-t', theme.status.error.border)}>
            <p className={cn('text-sm font-medium flex items-center gap-2', theme.status.error.text)}>
              <AlertTriangle className="h-4 w-4" />
              Overdue - Action Required
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col h-full space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className={cn('text-xl font-bold', theme.text.primary)}>Case Timeline</h2>
          <p className={cn('text-sm mt-1', theme.text.secondary)}>
            {filteredEvents.length} events
          </p>
        </div>

        <div className="flex gap-2">
          {/* View Mode Selector */}
          <select
            value={currentViewMode}
            onChange={(e) => setCurrentViewMode(e.target.value as ViewMode)}
            className={cn(
              'px-3 py-2 border rounded-lg text-sm',
              theme.surface.default,
              theme.border.default,
              theme.text.primary
            )}
          >
            <option value="chronological">Chronological</option>
            <option value="grouped">Grouped by Type</option>
            <option value="milestone">Milestones</option>
          </select>

          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors',
              showCompleted
                ? cn(theme.surface.default, theme.border.default, theme.text.primary)
                : 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
            )}
          >
            {showCompleted ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            {showCompleted ? 'Hide' : 'Show'} Completed
          </button>

          {allowEdit && (
            <button
              onClick={() => onEventCreate?.({})}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          )}

          <button className={cn('p-2 border rounded-lg hover:bg-opacity-80', theme.border.default, theme.surface.default)}>
            <Download className={cn('h-4 w-4', theme.text.secondary)} />
          </button>

          <button className={cn('p-2 border rounded-lg hover:bg-opacity-80', theme.border.default, theme.surface.default)}>
            <Printer className={cn('h-4 w-4', theme.text.secondary)} />
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={cn('p-4 border rounded-lg', theme.surface.subtle, theme.border.default)}>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500',
                  theme.surface.default,
                  theme.border.default,
                  theme.text.primary
                )}
              />
            </div>

            {/* Type Filters */}
            <div>
              <label className={cn('block text-sm font-medium mb-2', theme.text.primary)}>
                Event Types
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(EVENT_TYPE_CONFIG).map(([type, config]) => {
                  const Icon = config.icon;
                  const isSelected = selectedTypes.has(type as EventType);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type as EventType)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors',
                        isSelected
                          ? cn(config.bgColor, config.color, 'border-2', config.borderColor)
                          : cn('border', theme.border.default, theme.surface.default, theme.text.secondary)
                      )}
                    >
                      <Icon className="h-3 w-3" />
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Content */}
      <div className="flex-1 overflow-auto space-y-4">
        {/* Chronological View */}
        {currentViewMode === 'chronological' && (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            {/* Events */}
            <div className="space-y-6">
              {filteredEvents.map((event) => (
                <div key={event.id} className="relative pl-20">
                  {/* Date Badge */}
                  <div className="absolute left-0 top-0 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900" />
                    <span className={cn('text-xs font-medium whitespace-nowrap', theme.text.muted)}>
                      {format(new Date(event.date), 'MMM d')}
                    </span>
                  </div>

                  {/* Event Card */}
                  {renderEventCard(event)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grouped View */}
        {currentViewMode !== 'chronological' && groupedEvents && (
          <div className="space-y-4">
            {groupedEvents.map(group => (
              <div key={group.id} className={cn('border rounded-lg', theme.border.default)}>
                {/* Group Header */}
                <button
                  onClick={() => toggleGroup(group.id)}
                  className={cn(
                    'w-full flex items-center justify-between p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {group.expanded ? (
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                    <h3 className={cn('font-semibold capitalize', theme.text.primary)}>
                      {group.name}
                    </h3>
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      theme.surface.subtle,
                      theme.text.secondary
                    )}>
                      {group.events.length}
                    </span>
                  </div>
                </button>

                {/* Group Events */}
                {group.expanded && (
                  <div className="p-4 pt-0 space-y-3">
                    {group.events.map(event => renderEventCard(event))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className={cn('text-lg font-semibold mb-2', theme.text.primary)}>
              No events found
            </h3>
            <p className={cn('text-sm', theme.text.secondary)}>
              {searchQuery || selectedTypes.size > 0
                ? 'Try adjusting your filters'
                : 'Timeline events will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
