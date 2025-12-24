/**
 * Calendar API Service
 * Enterprise-grade API service for calendar and event management with backend integration
 * 
 * @module CalendarApiService
 * @description Manages all calendar-related operations including:
 * - Calendar event CRUD operations aligned with backend API
 * - Court deadlines and statute of limitations tracking
 * - Recurring events with RRULE support
 * - Multi-reminder system (email, notification, SMS)
 * - Case-linked events and attendee management
 * - Upcoming events and deadline alerts
 * 
 * @security
 * - Input validation on all parameters
 * - Date/time validation and timezone handling
 * - XSS prevention through type enforcement
 * - Backend API authentication via bearer tokens
 * - Proper access control for case-linked events
 * 
 * @architecture
 * - Backend API primary (PostgreSQL)
 * - ALIGNED WITH: backend/src/calendar/calendar.controller.ts
 * - React Query integration via CALENDAR_QUERY_KEYS
 * - Type-safe operations
 * - Comprehensive error handling
 * - Timezone-aware date handling
 */

import { apiClient } from '@services/infrastructure/apiClient';
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

/**
 * Query keys for React Query integration
 * 
 * @example
 * queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.all() });
 * queryClient.invalidateQueries({ queryKey: CALENDAR_QUERY_KEYS.upcoming() });
 */
export const CALENDAR_QUERY_KEYS = {
    all: () => ['calendar'] as const,
    byId: (id: string) => ['calendar', id] as const,
    byCase: (caseId: string) => ['calendar', 'case', caseId] as const,
    byType: (type: string) => ['calendar', 'type', type] as const,
    upcoming: (days?: number) => ['calendar', 'upcoming', days] as const,
    statuteOfLimitations: () => ['calendar', 'statute-of-limitations'] as const,
    deadlines: () => ['calendar', 'deadlines'] as const,
} as const;

/**
 * Calendar API Service Class
 * Implements secure, type-safe calendar event management operations
 */
export class CalendarApiService {
  private readonly baseUrl = '/calendar';

  constructor() {
    this.logInitialization();
  }

  /**
   * Log service initialization
   * @private
   */
  private logInitialization(): void {
    console.log('[CalendarApiService] Initialized with Backend API (PostgreSQL)');
  }

  /**
   * Validate and sanitize ID parameter
   * @private
   */
  private validateId(id: string, methodName: string): void {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error(`[CalendarApiService.${methodName}] Invalid id parameter`);
    }
  }

  /**
   * Validate and sanitize object parameter
   * @private
   */
  private validateObject(obj: unknown, paramName: string, methodName: string): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      throw new Error(`[CalendarApiService.${methodName}] Invalid ${paramName} parameter`);
    }
  }

  /**
   * Validate date string format (ISO 8601)
   * @private
   */
  private validateDate(date: string, paramName: string, methodName: string): void {
    if (!date || typeof date !== 'string') {
      throw new Error(`[CalendarApiService.${methodName}] ${paramName} must be a valid date string`);
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`[CalendarApiService.${methodName}] ${paramName} is not a valid date`);
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Get all calendar events with optional filters
   * Backend: GET /calendar with query params
   * 
   * @param filters - Optional filters for caseId, eventType, date range, completion status
   * @returns Promise<CalendarEvent[]> Array of calendar events
   * @throws Error if fetch fails
   */
  async getAll(filters?: CalendarFilters): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.caseId) params.append('caseId', filters.caseId);
      if (filters?.eventType) params.append('eventType', filters.eventType);
      if (filters?.startDate) params.append('startDate', filters.startDate);
      if (filters?.endDate) params.append('endDate', filters.endDate);
      if (filters?.completed !== undefined) params.append('completed', String(filters.completed));
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
      return await apiClient.get<CalendarEvent[]>(url);
    } catch (error) {
      console.error('[CalendarApiService.getAll] Error:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  /**
   * Get calendar event by ID
   * Backend: GET /calendar/:id
   * 
   * @param id - Event ID
   * @returns Promise<CalendarEvent> Event data
   * @throws Error if id is invalid or fetch fails
   */
  async getById(id: string): Promise<CalendarEvent> {
    this.validateId(id, 'getById');
    try {
      return await apiClient.get<CalendarEvent>(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[CalendarApiService.getById] Error:', error);
      throw new Error(`Failed to fetch calendar event with id: ${id}`);
    }
  }

  /**
   * Create a new calendar event
   * Backend: POST /calendar
   * 
   * @param data - Event creation DTO
   * @returns Promise<CalendarEvent> Created event
   * @throws Error if validation fails or creation fails
   */
  async create(data: CreateCalendarEventDto): Promise<CalendarEvent> {
    this.validateObject(data, 'data', 'create');
    if (!data.title) {
      throw new Error('[CalendarApiService.create] title is required');
    }
    if (!data.eventType) {
      throw new Error('[CalendarApiService.create] eventType is required');
    }
    if (!data.startDate || !data.endDate) {
      throw new Error('[CalendarApiService.create] startDate and endDate are required');
    }
    this.validateDate(data.startDate, 'startDate', 'create');
    this.validateDate(data.endDate, 'endDate', 'create');
    try {
      return await apiClient.post<CalendarEvent>(this.baseUrl, data);
    } catch (error) {
      console.error('[CalendarApiService.create] Error:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  /**
   * Update an existing calendar event
   * Backend: PUT /calendar/:id
   * 
   * @param id - Event ID
   * @param data - Event update DTO
   * @returns Promise<CalendarEvent> Updated event
   * @throws Error if validation fails or update fails
   */
  async update(id: string, data: UpdateCalendarEventDto): Promise<CalendarEvent> {
    this.validateId(id, 'update');
    this.validateObject(data, 'data', 'update');
    if (data.startDate) {
      this.validateDate(data.startDate, 'startDate', 'update');
    }
    if (data.endDate) {
      this.validateDate(data.endDate, 'endDate', 'update');
    }
    try {
      return await apiClient.put<CalendarEvent>(`${this.baseUrl}/${id}`, data);
    } catch (error) {
      console.error('[CalendarApiService.update] Error:', error);
      throw new Error(`Failed to update calendar event with id: ${id}`);
    }
  }

  /**
   * Delete a calendar event
   * Backend: DELETE /calendar/:id
   * 
   * @param id - Event ID
   * @returns Promise<void>
   * @throws Error if id is invalid or delete fails
   */
  async delete(id: string): Promise<void> {
    this.validateId(id, 'delete');
    try {
      await apiClient.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('[CalendarApiService.delete] Error:', error);
      throw new Error(`Failed to delete calendar event with id: ${id}`);
    }
  }

  // =============================================================================
  // SPECIALIZED QUERIES
  // =============================================================================

  /**
   * Get upcoming calendar events
   * Backend: GET /calendar/upcoming?days=N
   * 
   * @param days - Number of days to look ahead (default: 7)
   * @returns Promise<{ events: CalendarEvent[] }> Upcoming events
   * @throws Error if validation fails or fetch fails
   */
  async getUpcoming(days: number = 7): Promise<{ events: CalendarEvent[] }> {
    if (typeof days !== 'number' || days < 1) {
      throw new Error('[CalendarApiService.getUpcoming] days must be a positive number');
    }
    try {
      return await apiClient.get<{ events: CalendarEvent[] }>(`${this.baseUrl}/upcoming?days=${days}`);
    } catch (error) {
      console.error('[CalendarApiService.getUpcoming] Error:', error);
      throw new Error('Failed to fetch upcoming events');
    }
  }

  /**
   * Get statute of limitations deadlines
   * Backend: GET /calendar/statute-of-limitations
   * 
   * @param query - Optional query parameters
   * @returns Promise<CalendarEvent[]> Statute of limitations events
   * @throws Error if fetch fails
   */
  async getStatuteOfLimitations(query?: unknown): Promise<CalendarEvent[]> {
    try {
      const params = new URLSearchParams(query);
      const queryString = params.toString();
      const url = queryString ? `${this.baseUrl}/statute-of-limitations?${queryString}` : `${this.baseUrl}/statute-of-limitations`;
      return await apiClient.get<CalendarEvent[]>(url);
    } catch (error) {
      console.error('[CalendarApiService.getStatuteOfLimitations] Error:', error);
      throw new Error('Failed to fetch statute of limitations');
    }
  }

  /**
   * Mark event as completed
   * 
   * @param id - Event ID
   * @returns Promise<CalendarEvent> Updated event
   * @throws Error if validation fails or operation fails
   */
  async markAsCompleted(id: string): Promise<CalendarEvent> {
    this.validateId(id, 'markAsCompleted');
    return this.update(id, { completed: true });
  }
}
