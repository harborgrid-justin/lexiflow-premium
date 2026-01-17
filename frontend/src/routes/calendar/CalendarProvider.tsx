/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Calendar & Scheduling Domain - State Provider
 * Enterprise React Architecture Pattern
 */

import React, { createContext, useContext, useMemo, useState, useTransition } from 'react';

import type { CalendarLoaderData } from './loader';

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

interface CalendarMetrics {
  totalEvents: number;
  upcomingCount: number;
  todayCount: number;
}

interface CalendarState {
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  metrics: CalendarMetrics;
  viewMode: 'month' | 'week' | 'day' | 'list';
  selectedDate: Date;
}

interface CalendarContextValue extends CalendarState {
  setViewMode: (mode: 'month' | 'week' | 'day' | 'list') => void;
  setSelectedDate: (date: Date) => void;
  isPending: boolean;
}

const CalendarContext = createContext<CalendarContextValue | undefined>(undefined);

export interface CalendarProviderProps {
  children: React.ReactNode;
  initialData: CalendarLoaderData;
}

export function CalendarProvider({ children, initialData }: CalendarProviderProps) {
  const loaderData = initialData;

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPending] = useTransition();

  const metrics = useMemo<CalendarMetrics>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    return {
      totalEvents: loaderData.events.length,
      upcomingCount: loaderData.upcomingEvents.length,
      todayCount: loaderData.events.filter(e => {
        const eventDate = new Date(e.startDate);
        return eventDate >= today && eventDate <= todayEnd;
      }).length,
    };
  }, [loaderData]);

  const contextValue = useMemo<CalendarContextValue>(() => ({
    events: loaderData.events,
    upcomingEvents: loaderData.upcomingEvents,
    metrics,
    viewMode,
    selectedDate,
    setViewMode,
    setSelectedDate,
    isPending,
  }), [loaderData, metrics, viewMode, selectedDate, isPending]);

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): CalendarContextValue {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within CalendarProvider');
  }
  return context;
}
