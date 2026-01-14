/**
 * Calendar & Scheduling Domain - Page Component
 * Enterprise React Architecture Pattern
 */

import { CalendarProvider } from './CalendarProvider';
import { CalendarView } from './CalendarView';

export function CalendarPage() {
  return (
    <CalendarProvider>
      <CalendarView />
    </CalendarProvider>
  );
}

export default CalendarPage;
