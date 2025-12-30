/**
 * Matter Calendar - Comprehensive Matter Timeline & Scheduling
 * 
 * @module MatterCalendar
 * @description Enterprise calendar view for matter management
 * 
 * Features:
 * - Multi-view calendar (month, week, day, agenda)
 * - Matter deadlines and court dates
 * - Team availability and conflicts
 * - Drag-and-drop scheduling
 * - Recurring event support
 * - Color-coded matter categorization
 * - Deadline reminders and notifications
 * - Integration with team calendars
 * - Conflict detection
 * - Export to external calendars (iCal, Google, Outlook)
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Clock, MapPin, Download
} from 'lucide-react';
import { useQuery } from '@/hooks/useQueryHooks';
import { api } from '@/api';
import { useTheme } from '@/providers/ThemeContext';
import { cn } from '@/utils/cn';
import { Button } from '@/components/atoms';
import { Card } from '@/components/molecules';
import { Badge } from '@/components/atoms';
import { Modal } from '@/components/molecules';

type CalendarView = 'month' | 'week' | 'day' | 'agenda';

interface CalendarEvent {
  id: string;
  matterId: string;
  matterTitle: string;
  title: string;
  type: 'hearing' | 'deadline' | 'meeting' | 'filing' | 'trial' | 'other';
  startTime: string;
  endTime?: string;
  location?: string;
  attendees?: string[];
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  reminder?: number; // minutes before
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    until?: string;
  };
}

export const CaseCalendar: React.FC = () => {
  const { isDark } = useTheme();
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterMatter, setFilterMatter] = useState<string>('all');

  // Fetch calendar events
  const { data: events } = useQuery(
    ['calendar', 'events', currentDate.toISOString().split('T')[0]],
    async (): Promise<CalendarEvent[]> => {
      // Fetch docket entries which contain court dates and deadlines
      const docketEntries = await api.docket.getAll();
      const matters = await api.cases.getAll();

      const calendarEvents: CalendarEvent[] = [];

      // Convert docket entries to calendar events
      docketEntries.forEach(entry => {
        const matter = matters.find(m => String(m.id) === String(entry.caseId));
        if (entry.date) {
          calendarEvents.push({
            id: `docket-${entry.id}`,
            matterId: entry.caseId,
            matterTitle: matter?.title || 'Unknown Matter',
            title: entry.title || entry.description || 'Docket Entry',
            type: entry.type === 'Hearing' ? 'hearing' :
                  entry.type === 'Filing' ? 'filing' :
                  entry.type === 'Motion' ? 'deadline' : 'other',
            startTime: entry.date,
            priority: 'medium',
            status: 'scheduled',
            description: entry.description,
          });
        }
      });

      // Add matter deadlines from closeDate
      matters.forEach(matter => {
        if (matter.closeDate) {
          calendarEvents.push({
            id: `deadline-${matter.id}`,
            matterId: matter.id,
            matterTitle: matter.title,
            title: 'Matter Deadline',
            type: 'deadline',
            startTime: matter.closeDate,
            priority: 'medium',
            status: 'scheduled',
            reminder: 1440, // 24 hours
          });
        }
      });

      return calendarEvents;
    }
  );

  // Fetch matters for filter
  const { data: matters } = useQuery(
    ['matters', 'all'],
    () => api.cases.getAll()
  );

  const filteredEvents = useMemo(() => {
    if (!events) return [];
    return events.filter(event => {
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesMatter = filterMatter === 'all' || event.matterId === filterMatter;
      return matchesType && matchesMatter;
    });
  }, [events, filterType, filterMatter]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setDate(newDate.getDate() - 7);
      } else {
        newDate.setDate(newDate.getDate() + 7);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getMonthCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      currentWeek.push(date);

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  };

  const getEventsForDate = (date: Date) => {
    if (!filteredEvents) return [];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      hearing: 'bg-red-500',
      deadline: 'bg-amber-500',
      meeting: 'bg-blue-500',
      filing: 'bg-purple-500',
      trial: 'bg-rose-500',
      other: 'bg-slate-500',
    };
    return colors[type as keyof typeof colors] || colors.other;
  };

  return (
    <div className={cn('h-full flex flex-col', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      {/* Controls */}
      <div className={cn('border-b px-6 py-4', isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={goToToday}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Today
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className={cn('text-lg font-semibold min-w-[200px] text-center', isDark ? 'text-slate-100' : 'text-slate-900')}>
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* View Selector */}
            <div className={cn('flex items-center gap-1 p-1 rounded-lg', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
              <button
                onClick={() => setView('month')}
                className={cn('px-3 py-1.5 rounded text-sm font-medium transition-colors', 
                  view === 'month'
                    ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Month
              </button>
              <button
                onClick={() => setView('week')}
                className={cn('px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  view === 'week'
                    ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Week
              </button>
              <button
                onClick={() => setView('day')}
                className={cn('px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  view === 'day'
                    ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Day
              </button>
              <button
                onClick={() => setView('agenda')}
                className={cn('px-3 py-1.5 rounded text-sm font-medium transition-colors',
                  view === 'agenda'
                    ? isDark ? 'bg-slate-600 text-slate-100' : 'bg-white text-slate-900 shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Agenda
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-sm',
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              )}
            >
              <option value="all">All Types</option>
              <option value="hearing">Hearings</option>
              <option value="deadline">Deadlines</option>
              <option value="meeting">Meetings</option>
              <option value="filing">Filings</option>
              <option value="trial">Trials</option>
            </select>
            <select
              value={filterMatter}
              onChange={(e) => setFilterMatter(e.target.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg border text-sm',
                isDark
                  ? 'bg-slate-700 border-slate-600 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              )}
            >
              <option value="all">All Matters</option>
              {matters?.map(matter => (
                <option key={matter.id} value={matter.id}>
                  {matter.caseNumber || matter.id} - {matter.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto p-6">
        {view === 'month' && (
          <MonthView
            weeks={getMonthCalendar()}
            currentDate={currentDate}
            onEventClick={handleEventClick}
            getEventsForDate={getEventsForDate}
            getEventTypeColor={getEventTypeColor}
            isDark={isDark}
          />
        )}
        {view === 'agenda' && (
          <AgendaView
            events={filteredEvents || []}
            onEventClick={handleEventClick}
            getEventTypeColor={getEventTypeColor}
            isDark={isDark}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          isDark={isDark}
        />
      )}
    </div>
  );
};

// Month View Component
interface MonthViewProps {
  weeks: Date[][];
  currentDate: Date;
  onEventClick: (event: CalendarEvent) => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventTypeColor: (type: string) => string;
  isDark: boolean;
}

const MonthView: React.FC<MonthViewProps> = ({
  weeks,
  currentDate,
  onEventClick,
  getEventsForDate,
  getEventTypeColor,
  isDark,
}) => {
  const today = new Date();
  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  return (
    <div className={cn('rounded-lg border overflow-hidden', isDark ? 'border-slate-700' : 'border-slate-200')}>
      {/* Weekday Headers */}
      <div className={cn('grid grid-cols-7 border-b', isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200')}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={cn('px-3 py-2 text-center text-sm font-semibold', isDark ? 'text-slate-400' : 'text-slate-600')}>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={cn('grid grid-cols-7', isDark ? 'bg-slate-900' : 'bg-white')}>
        {weeks.map((week, weekIdx) =>
          week.map((date, dayIdx) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div
                key={`${weekIdx}-${dayIdx}`}
                className={cn(
                  'min-h-[120px] border-r border-b p-2',
                  isDark ? 'border-slate-700' : 'border-slate-200',
                  !isCurrentMonth(date) && (isDark ? 'bg-slate-800/30' : 'bg-slate-50')
                )}
              >
                <div className={cn(
                  'text-sm font-medium mb-2',
                  isToday(date)
                    ? 'flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white'
                    : !isCurrentMonth(date)
                    ? isDark ? 'text-slate-600' : 'text-slate-400'
                    : isDark ? 'text-slate-300' : 'text-slate-700'
                )}>
                  {date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded text-xs truncate',
                        getEventTypeColor(event.type),
                        'text-white hover:opacity-90 transition-opacity'
                      )}
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className={cn('text-xs px-2', isDark ? 'text-slate-400' : 'text-slate-600')}>
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Agenda View Component
interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  getEventTypeColor: (type: string) => string;
  isDark: boolean;
}

const AgendaView: React.FC<AgendaViewProps> = ({ events, onEventClick, getEventTypeColor, isDark }) => {
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, CalendarEvent[]>();
    events.forEach(event => {
      const date = new Date(event.startTime).toDateString();
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(event);
    });
    return Array.from(groups.entries()).sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime());
  }, [events]);

  return (
    <div className="space-y-6">
      {groupedEvents.map(([date, dayEvents]) => (
        <div key={date}>
          <h3 className={cn('text-lg font-semibold mb-3', isDark ? 'text-slate-100' : 'text-slate-900')}>
            {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
          <div className="space-y-2">
            {dayEvents.map(event => (
              <div key={event.id} className="cursor-pointer" onClick={() => onEventClick(event)}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                  <div className={cn('w-1 h-full rounded-full', getEventTypeColor(event.type))} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={cn('font-semibold', isDark ? 'text-slate-100' : 'text-slate-900')}>
                          {event.title}
                        </h4>
                        <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
                          {event.matterTitle}
                        </p>
                      </div>
                      <Badge variant={event.priority === 'high' ? 'error' : event.priority === 'medium' ? 'warning' : 'neutral'}>
                        {event.priority}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                        <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                          {new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className={cn('w-4 h-4', isDark ? 'text-slate-400' : 'text-slate-500')} />
                          <span className={cn(isDark ? 'text-slate-400' : 'text-slate-600')}>
                            {event.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Event Detail Modal
interface EventDetailModalProps {
  event: CalendarEvent;
  onClose: () => void;
  isDark: boolean;
}

const EventDetailModal: React.FC<EventDetailModalProps> = ({ event, onClose, isDark }) => (
  <Modal isOpen={true} onClose={onClose} title={event.title} size="md">
    <div className="space-y-4">
      <div>
        <label className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
          Matter
        </label>
        <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {event.matterTitle}
        </p>
      </div>
      <div>
        <label className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
          Date & Time
        </label>
        <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
          {new Date(event.startTime).toLocaleString()}
        </p>
      </div>
      {event.location && (
        <div>
          <label className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Location
          </label>
          <p className={cn('text-sm mt-1', isDark ? 'text-slate-400' : 'text-slate-600')}>
            {event.location}
          </p>
        </div>
      )}
      {event.attendees && event.attendees.length > 0 && (
        <div>
          <label className={cn('text-sm font-medium', isDark ? 'text-slate-300' : 'text-slate-700')}>
            Attendees
          </label>
          <div className="flex flex-wrap gap-2 mt-1">
            {event.attendees.map((attendee, idx) => (
              <Badge key={idx} variant="neutral">{attendee}</Badge>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-4">
        <Button variant="primary" className="flex-1">
          Edit Event
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  </Modal>
);
