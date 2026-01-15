/**
 * Calendar & Scheduling Domain - View Component
 * Enterprise React Architecture Pattern
 */

import { Button } from '@/components/organisms/_legacy/Button';
import { PageHeader } from '@/shared/ui/organisms/PageHeader';
import { Calendar as CalendarIcon, Clock, Plus } from 'lucide-react';
import React, { useCallback } from 'react';
import { useCalendar } from './CalendarProvider';
import { CalendarEvent } from './components/CalendarEvent/CalendarEvent';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { CalendarToolbar } from './components/CalendarToolbar/CalendarToolbar';

export function CalendarView() {
  const {
    events,
    upcomingEvents,
    metrics,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    isPending
  } = useCalendar();

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setSelectedDate(newDate);
  }, [selectedDate, viewMode, setSelectedDate]);

  const handleNext = useCallback(() => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setSelectedDate(newDate);
  }, [selectedDate, viewMode, setSelectedDate]);

  const handleToday = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  const monthLabel = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const renderCell = useCallback((date: Date) => {
    const dayEvents = events.filter(e => {
      const eDate = new Date(e.startDate);
      return eDate.getDate() === date.getDate() &&
        eDate.getMonth() === date.getMonth() &&
        eDate.getFullYear() === date.getFullYear();
    });

    return (
      <div className="flex flex-col gap-1 p-1">
        {dayEvents.map(event => (
          <CalendarEvent
            key={event.id}
            title={event.title}
            variant={event.type === 'hearing' ? 'critical' : 'default'}
            isCompact={true}
          />
        ))}
      </div>
    );
  }, [events]);

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 text-sm sm:text-base">
        <MetricCard
          icon={<CalendarIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
          label="Total Events"
          value={metrics.totalEvents}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
          label="Today"
          value={metrics.todayCount}
        />
        <MetricCard
          icon={<CalendarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
          label="Upcoming"
          value={metrics.upcomingCount}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 px-4 pb-4">
        <div className="mb-4">
          <CalendarToolbar
            label={monthLabel}
            onPrev={handlePrev}
            onNext={handleNext}
            onToday={handleToday}
            view={viewMode === 'list' ? 'list' : 'month'}
            onViewChange={(v) => setViewMode(v)}
          />
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="flex-1 overflow-hidden rounded-lg border shadow-sm relative">
          {isPending && (
            <div style={{ backgroundColor: 'var(--color-surface)', opacity: 0.5 }} className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}

          {viewMode === 'month' && (
            <div className="h-full overflow-y-auto">
              <CalendarGrid
                currentDate={selectedDate}
                renderCell={renderCell}
                onDateClick={(date) => console.log('Clicked', date)}
              />
            </div>
          )}

          {viewMode === 'list' && (
            <div className="h-full overflow-y-auto p-4 space-y-3">
              {upcomingEvents.map(event => (
                <EventParamsCard key={event.id} event={event} />
              ))}
              {upcomingEvents.length === 0 && (
                <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                  No upcoming events
                </div>
              )}
            </div>
          )}

          {(viewMode === 'week' || viewMode === 'day') && (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div className="max-w-md">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  {viewMode === 'week' ? 'Week' : 'Day'} View Coming Soon
                </h3>
                <p className="text-slate-500 dark:text-slate-400">
                  We are currently working on optimizing the granular views. Please use the Month or List view for now.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4">
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

// Renamed locally to avoid conflict if we decide to re-export or just clarity
function EventParamsCard({ event }: { event: any }) {
  return (
    <div style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }} className="rounded-lg border p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="font-medium text-slate-900 dark:text-white">{event.title}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {new Date(event.startDate).toLocaleString()}
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium
          ${event.type === 'hearing'
            ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
          }`}>
          {event.type}
        </span>
      </div>
    </div>
  )
}
