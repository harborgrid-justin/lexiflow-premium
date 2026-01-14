/**
 * Calendar & Scheduling Domain - View Component
 * Enterprise React Architecture Pattern
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Calendar, Clock, MapPin, Plus, Users } from 'lucide-react';
import React from 'react';
import { useCalendar } from './CalendarProvider';

export function CalendarView() {
  const { events, upcomingEvents, metrics, viewMode, setViewMode, isPending } = useCalendar();

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Calendar"
        subtitle="Court dates, deadlines, and appointments"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" />
            New Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        <MetricCard
          icon={<Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Events"
          value={metrics.totalEvents}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Today"
          value={metrics.todayCount}
        />
        <MetricCard
          icon={<Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          label="Upcoming"
          value={metrics.upcomingCount}
        />
      </div>

      <div className="px-4 pb-4">
        <div className="flex gap-2">
          <ViewButton active={viewMode === 'month'} onClick={() => setViewMode('month')}>
            Month
          </ViewButton>
          <ViewButton active={viewMode === 'week'} onClick={() => setViewMode('week')}>
            Week
          </ViewButton>
          <ViewButton active={viewMode === 'day'} onClick={() => setViewMode('day')}>
            Day
          </ViewButton>
          <ViewButton active={viewMode === 'list'} onClick={() => setViewMode('list')}>
            List
          </ViewButton>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {isPending && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        )}

        {!isPending && viewMode === 'list' && (
          <div className="space-y-3">
            {upcomingEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))}
            {upcomingEvents.length === 0 && (
              <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                No upcoming events
              </div>
            )}
          </div>
        )}

        {!isPending && viewMode !== 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">
              Calendar view coming soon
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ViewButton({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${active
        ? 'bg-blue-600 text-white'
        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
        }`}
    >
      {children}
    </button>
  );
}

type CalendarEvent = {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate?: string;
  location?: string;
  caseId?: string;
  attendees?: string[];
  status: string;
};

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-white">{event.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {new Date(event.startDate).toLocaleString()}
          </div>
        </div>
        <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
          {event.type}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
        {event.location && (
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {event.location}
          </span>
        )}
        {event.attendees && event.attendees.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {event.attendees.length} attendees
          </span>
        )}
      </div>
    </div>
  );
}
