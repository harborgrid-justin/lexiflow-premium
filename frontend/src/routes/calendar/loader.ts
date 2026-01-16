/**
 * ENTERPRISE REACT ARCHITECTURE STANDARD
 * See: routes/_shared/ENTERPRISE_REACT_ARCHITECTURE_STANDARD.md
 */

/**
 * Calendar & Scheduling Domain - Data Loader
 * Enterprise React Architecture Pattern
 */

import { DataService } from "@/services/data/data-service.service";

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

export interface CalendarLoaderData {
  events: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
}

export async function calendarLoader() {
  const events = await DataService.calendar.getAll().catch(() => []);
  const today = new Date();
  const upcoming = events
    .filter((e: CalendarEvent) => new Date(e.startDate) >= today)
    .slice(0, 10);

  return {
    events: events || [],
    upcomingEvents: upcoming || [],
  };
}
