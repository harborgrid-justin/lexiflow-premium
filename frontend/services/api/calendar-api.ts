/**
 * Calendar API Service
 * Manages calendar events and deadlines
 */

import { apiClient } from '../apiClient';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  eventType: 'hearing' | 'deposition' | 'deadline' | 'meeting' | 'court_appearance' | 'trial' | 'conference' | 'filing_deadline';
  startTime: string;
  endTime?: string;
  location?: string;
  caseId?: string;
  matterId?: string;
  attendees?: string[];
  reminders?: {
    time: string;
    method: 'email' | 'notification' | 'sms';
  }[];
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval?: number;
    until?: string;
  };
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarFilters {
  caseId?: string;
  matterId?: string;
  eventType?: CalendarEvent['eventType'];
  startDate?: string;
  endDate?: string;
  status?: CalendarEvent['status'];
}

export class CalendarApiService {
  private readonly baseUrl = '/calendar';

  async getAll(filters?: CalendarFilters): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (filters?.caseId) params.append('caseId', filters.caseId);
    if (filters?.matterId) params.append('matterId', filters.matterId);
    if (filters?.eventType) params.append('eventType', filters.eventType);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.status) params.append('status', filters.status);
    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    return apiClient.get<CalendarEvent[]>(url);
  }

  async getById(id: string): Promise<CalendarEvent> {
    return apiClient.get<CalendarEvent>(`${this.baseUrl}/${id}`);
  }

  async getUpcoming(days: number = 30): Promise<CalendarEvent[]> {
    return apiClient.get<CalendarEvent[]>(`${this.baseUrl}/upcoming?days=${days}`);
  }

  async create(data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return apiClient.post<CalendarEvent>(this.baseUrl, data);
  }

  async update(id: string, data: Partial<CalendarEvent>): Promise<CalendarEvent> {
    return apiClient.put<CalendarEvent>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    return apiClient.delete(`${this.baseUrl}/${id}`);
  }
}
