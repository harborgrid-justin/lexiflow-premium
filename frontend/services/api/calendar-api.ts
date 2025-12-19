/**
 * Calendar API Service
 * ALIGNED WITH BACKEND: backend/src/calendar/calendar.controller.ts
 * Manages calendar events and deadlines
 */

import { apiClient } from '../infrastructure/apiClient';
import type { CalendarEventType } from '../../types';

// DTOs matching backend calendar/dto/calendar.dto.ts
export interface CreateCalendarEventDto {
  title: string;
  eventType: CalendarEventType;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
  attendees?: string[];
  caseId?: string;
  reminder?: string;
}

export interface UpdateCalendarEventDto {
  title?: string;
  eventType?: CalendarEventType;
  startDate?: string;
  endDate?: string;
  description?: string;
  location?: string;
  attendees?: string[];
  caseId?: string;
  reminder?: string;
  completed?: boolean;
}

export interface CalendarEvent extends BaseEntity {
  // Backend: calendar_events table
  title: string; // Backend: varchar (required)
  eventType: CalendarEventType; // Backend: enum (default: REMINDER)
  startDate: string; // Backend: start_date timestamp (required)
  endDate: string; // Backend: end_date timestamp (required)
  description?: string; // Backend: text
  location?: string; // Backend: varchar
  attendees?: string[]; // Backend: json
  caseId?: string; // Backend: case_id uuid
  reminder?: string; // Backend: varchar
  completed: boolean; // Backend: boolean (default: false)
  
  // Legacy aliases
  startTime?: string; // Alias for startDate
  endTime?: string; // Alias for endDate
  matterId?: string; // Frontend extension
  status?: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    until?: string;
  };
  reminders?: {
    time: string;
    method: 'email' | 'notification' | 'sms';
  }[];
  metadata?: Record<string, any>;
}

interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarFilters {
  caseId?: string;
  eventType?: CalendarEventType;
  startDate?: string;
  endDate?: string;
  completed?: boolean;
}

export class CalendarApiService {
  private readonly baseUrl = '/calendar';

  // Backend: GET /calendar with query params
  async getAll(filters?: CalendarFilters): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<CalendarEvent[]>(url);
  }

  // Backend: GET /calendar/upcoming?days=N
  async getUpcoming(days: number = 7): Promise<{ events: CalendarEvent[] }> {
    return apiClient.get<{ events: CalendarEvent[] }>(`${this.baseUrl}/upcoming?days=${days}`);
  }

  // Backend: GET /calendar/statute-of-limitations
  async getStatuteOfLimitations(query?: any): Promise<CalendarEvent[]> {
    const params = new URLSearchParams(query);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}/statute-of-limitations?${queryString}` : `${this.baseUrl}/statute-of-limitations`;
    return apiClient.get<CalendarEvent[]>(url);
  }

  // Backend: GET /calendar/:id
  async getById(id: string): Promise<CalendarEvent> {
    return apiClient.get<CalendarEvent>(`${this.baseUrl}/${id}`);
  }

  // Backend: POST /calendar
  async create(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    return apiClient.post<CalendarEvent>(this.baseUrl, data);
  }

  // Backend: PUT /calendar/:id
  async update(id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    return apiClient.put<CalendarEvent>(`${this.baseUrl}/${id}`, data);
  }

  // Backend: DELETE /calendar/:id
  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
