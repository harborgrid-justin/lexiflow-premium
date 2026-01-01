/**
 * DeadlineList Component
 * Displays upcoming deadlines with priority indicators and court-specific features
 */

import React, { useState } from 'react';
import type { CalendarEvent } from '@/api/workflow/calendar-api';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';

export interface DeadlineListProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onComplete?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  showCompleted?: boolean;
  filter?: 'all' | 'upcoming' | 'today' | 'overdue';
  className?: string;
}

export function DeadlineList({
  events,
  onEventClick,
  onComplete,
  onDelete,
  showCompleted = false,
  filter = 'all',
  className = '',
}: DeadlineListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'type'>('date');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (!showCompleted && event.completed) return false;

    const eventDate = new Date(event.startDate);

    switch (filter) {
      case 'upcoming':
        return eventDate >= today && !event.completed;
      case 'today':
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDay.getTime() === today.getTime();
      case 'overdue':
        return eventDate < today && !event.completed;
      default:
        return true;
    }
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'priority': {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        const aPriority = (a.metadata?.priority as keyof typeof priorityOrder) || 'medium';
        const bPriority = (b.metadata?.priority as keyof typeof priorityOrder) || 'medium';
        return priorityOrder[aPriority] - priorityOrder[bPriority];
      }
      case 'type':
        return a.eventType.localeCompare(b.eventType);
      default:
        return 0;
    }
  });

  const getPriorityColor = (event: CalendarEvent): string => {
    const daysUntil = differenceInDays(new Date(event.startDate), now);

    if (event.completed) return 'text-gray-500 border-gray-300';
    if (daysUntil < 0) return 'text-red-700 border-red-500 bg-red-50 dark:bg-red-900/20';
    if (daysUntil === 0) return 'text-orange-700 border-orange-500 bg-orange-50 dark:bg-orange-900/20';
    if (daysUntil <= 3) return 'text-amber-700 border-amber-500 bg-amber-50 dark:bg-amber-900/20';
    if (daysUntil <= 7) return 'text-yellow-700 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    return 'text-blue-700 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'COURT_HEARING':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
          </svg>
        );
      case 'FILING_DEADLINE':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'DISCOVERY_DEADLINE':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'STATUTE_OF_LIMITATIONS':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'REMINDER':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Header with filters */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Deadlines ({sortedEvents.length})
        </h3>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="date">Sort by Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      {/* Deadline list */}
      {sortedEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <svg className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-500 dark:text-gray-400">No deadlines found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedEvents.map((event) => {
            const daysUntil = differenceInDays(new Date(event.startDate), now);
            const isOverdue = daysUntil < 0 && !event.completed;
            const isToday = daysUntil === 0;
            const priorityColor = getPriorityColor(event);

            return (
              <div
                key={event.id}
                onClick={() => onEventClick?.(event)}
                className={`group relative flex items-start gap-3 rounded-lg border-l-4 p-4 transition-colors ${priorityColor} ${
                  onEventClick ? 'cursor-pointer hover:shadow-md' : ''
                } ${event.completed ? 'opacity-60' : ''}`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 pt-0.5">
                  {getEventTypeIcon(event.eventType)}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h4 className={`text-sm font-semibold ${event.completed ? 'line-through' : ''}`}>
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className="mt-1 text-sm opacity-80">{event.description}</p>
                      )}
                      {event.location && (
                        <p className="mt-1 flex items-center gap-1 text-xs opacity-70">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </p>
                      )}
                      {event.caseId && (
                        <p className="mt-1 text-xs opacity-70">Case: {event.caseId}</p>
                      )}
                    </div>

                    {/* Date info */}
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="text-xs font-medium">
                        {format(new Date(event.startDate), 'MMM d, yyyy')}
                      </span>
                      <span className="text-xs opacity-70">
                        {format(new Date(event.startDate), 'h:mm a')}
                      </span>
                      {isOverdue && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                          Overdue
                        </span>
                      )}
                      {isToday && !event.completed && (
                        <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-medium text-white">
                          Today
                        </span>
                      )}
                      {!isOverdue && !isToday && !event.completed && (
                        <span className="text-xs opacity-70">
                          {formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event type badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-md bg-black/10 px-2 py-0.5 text-xs font-medium">
                      {event.eventType.replace(/_/g, ' ')}
                    </span>
                    {event.reminder && (
                      <span className="flex items-center gap-1 text-xs opacity-70">
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {event.reminder}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!event.completed && onComplete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onComplete(event);
                      }}
                      className="rounded p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/20"
                      title="Mark as complete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this deadline?')) {
                          onDelete(event);
                        }
                      }}
                      className="rounded p-1 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Completed checkmark */}
                {event.completed && (
                  <div className="absolute right-2 top-2">
                    <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
