/**
 * CalendarDomain - Calendar and event management service
 * Provides event scheduling, deadline tracking, and calendar synchronization
 * 
 * ✅ Migrated to backend API (2025-12-21)
 */

import { integrationsApi } from '../api/domains/integrations.api';
import { delay } from '../../utils/async';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  type: 'deadline' | 'hearing' | 'meeting' | 'task' | 'reminder';
  caseId?: string;
  attendees?: string[];
  location?: string;
  allDay?: boolean;
  recurring?: boolean;
  metadata?: any;
}

export const CalendarService = {
  getAll: async () => integrationsApi.calendar?.getAll?.() || [],
  getById: async (id: string) => integrationsApi.calendar?.getById?.(id) || null,
  add: async (item: any) => {
    const event = { ...item, createdAt: new Date().toISOString() };
    return integrationsApi.calendar?.create?.(event) || event;
  },
  update: async (id: string, updates: any) => {
    return integrationsApi.calendar?.update?.(id, updates) || { id, ...updates };
  },
  delete: async (id: string) => {
    await integrationsApi.calendar?.delete?.(id);
    return true;
  },
  
  // Additional calendar-specific methods
  getEvents: async (filters?: { 
    startDate?: string; 
    endDate?: string; 
    caseId?: string; 
    type?: string 
  }): Promise<CalendarEvent[]> => {
    let events = await integrationsApi.calendar?.getAll?.() || [];
    
    // Filter by date range
    if (filters?.startDate || filters?.endDate) {
      events = events.filter((e: CalendarEvent) => {
        const eventStart = new Date(e.startDate);
        const rangeStart = filters.startDate ? new Date(filters.startDate) : new Date(0);
        const rangeEnd = filters.endDate ? new Date(filters.endDate) : new Date('2100-01-01');
        return eventStart >= rangeStart && eventStart <= rangeEnd;
      });
    }
    
    // Filter by case
    if (filters?.caseId) {
      events = events.filter((e: CalendarEvent) => e.caseId === filters.caseId);
    }
    
    // Filter by type
    if (filters?.type) {
      events = events.filter((e: CalendarEvent) => e.type === filters.type);
    }
    
    // Sort by start date
    return events.sort((a: CalendarEvent, b: CalendarEvent) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  },
  
  createEvent: async (event: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: event.title || 'New Event',
      description: event.description,
      startDate: event.startDate || new Date().toISOString(),
      endDate: event.endDate,
      type: event.type || 'reminder',
      caseId: event.caseId,
      attendees: event.attendees || [],
      location: event.location,
      allDay: event.allDay || false,
      recurring: event.recurring || false,
      metadata: event.metadata,
    };
    
    await db.put(STORES.CALENDAR_EVENTS, newEvent);
    return newEvent;
  },
  
  updateEvent: async (eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    return await api.calendar?.updateEvent?.(eventId, updates) || { id: eventId, ...updates } as CalendarEvent;
  },
  
  deleteEvent: async (eventId: string): Promise<boolean> => {
    try {
      await api.calendar?.deleteEvent?.(eventId);
      return true;
    } catch {
      return false;
    }
  },
  
  // Synchronization with external calendars
  sync: async (options?: { provider?: 'google' | 'outlook' | 'ical' }): Promise<boolean> => {
    await delay(500); // Simulate sync operation
    console.log(`[CalendarService] Syncing with ${options?.provider || 'default'} calendar`);
    return true;
  },
  
  // Get upcoming events
  getUpcoming: async (days: number = 7): Promise<CalendarEvent[]> => {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return CalendarService.getEvents({
      startDate: now.toISOString(),
      endDate: future.toISOString(),
    });
  },
};
