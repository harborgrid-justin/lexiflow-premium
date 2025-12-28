/**
 * @module hooks/useCalendarView
 * @category Hooks - Calendar
 * 
 * Manages calendar view state with month navigation and event loading.
 * Provides day-based event filtering for grid rendering.
 * 
 * @example
 * ```typescript
 * const calendar = useCalendarView();
 * 
 * <button onClick={() => calendar.changeMonth(-1)}>Previous</button>
 * <button onClick={() => calendar.changeMonth(1)}>Next</button>
 * <button onClick={calendar.goToToday}>Today</button>
 * 
 * {Array.from({ length: calendar.daysInMonth }).map((_, day) => (
 *   <Day events={calendar.getEventsForDay(day + 1)} />
 * ))}
 * ```
 */

// ============================================================================
// EXTERNAL DEPENDENCIES
// ============================================================================
import { useState, useEffect, useMemo, useCallback } from 'react';

// ============================================================================
// INTERNAL DEPENDENCIES
// ============================================================================
// Services & Data
import { DataService } from '@/services';

// Types
import { CalendarEventItem } from '@/types';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Return type for useCalendarView hook
 */
export interface UseCalendarViewReturn {
  /** Current month being displayed */
  currentMonth: Date;
  /** All loaded events */
  events: CalendarEventItem[];
  /** Number of days in current month */
  daysInMonth: number;
  /** First day of month (0 = Sunday) */
  firstDay: number;
  /** Get events for specific day */
  getEventsForDay: (day: number) => CalendarEventItem[];
  /** Navigate months */
  changeMonth: (offset: number) => void;
  /** Jump to today */
  goToToday: () => void;
  /** Formatted month label */
  monthLabel: string;
  /** Whether events are loading */
  isLoading: boolean;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Manages calendar view state and navigation.
 * 
 * @returns Object with calendar state and controls
 */
export function useCalendarView(): UseCalendarViewReturn {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
      const loadEvents = async () => {
          setIsLoading(true);
          try {
            const data = await DataService.calendar.getEvents();
            setEvents(Array.isArray(data) ? data : []);
          } catch (error) {
            console.error('Failed to load calendar events:', error);
            setEvents([]);
          }
          setIsLoading(false);
      };
      loadEvents();
  }, []);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const getEventsForDay = useCallback((day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    // Ensure events is always an array before filtering
    const eventsArray = Array.isArray(events) ? events : [];
    return eventsArray.filter(e => e.date === dateStr);
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
}
