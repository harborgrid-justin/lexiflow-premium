/**
 * @module hooks/useCalendarView
 * @category Hooks - Calendar
 * @description Calendar view state management hook with month navigation, event loading, and day-based
 * event filtering. Manages currentMonth state, loads events from DataService, provides changeMonth/goToToday
 * navigation helpers, and calculates daysInMonth/firstDay for grid layout. Memoized getEventsForDay
 * returns events matching YYYY-MM-DD format for efficient day cell rendering.
 * 
 * NO THEME USAGE: Utility hook for calendar state management
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '../services/dataService';

// Types
import { CalendarEventItem } from '../types';

// ============================================================================
// HOOK
// ============================================================================
export const useCalendarView = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const loadEvents = async () => {
          setIsLoading(true);
          const data = await DataService.calendar.getEvents();
          setEvents(data);
          setIsLoading(false);
      };
      loadEvents();
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getEventsForDay = useCallback((day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  }, [currentMonth, events]);

  const changeMonth = useCallback((offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentMonth(new Date());
  }, []);

  const monthLabel = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  return {
    currentMonth,
    events,
    daysInMonth,
    firstDay,
    getEventsForDay,
    changeMonth,
    goToToday,
    monthLabel,
    isLoading
  };
};