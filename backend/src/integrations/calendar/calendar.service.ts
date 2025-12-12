import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CreateCalendarEventDto, CalendarSyncDto, CalendarEvent } from './dto';

/**
 * Calendar Integration Service
 * Integrates with Google Calendar, Outlook, and other calendar systems
 * for managing legal deadlines, depositions, and court dates
 */
@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private readonly events = new Map<string, CalendarEvent>();

  /**
   * Create a calendar event
   */
  async createEvent(createEventDto: CreateCalendarEventDto, userId: string): Promise<CalendarEvent> {
    this.logger.log('Creating calendar event:', createEventDto);

    try {
      // TODO: Implement actual calendar API integration (Google Calendar, Outlook, etc.)
      // For now, store in memory
      const event: CalendarEvent = {
        id: this.generateId(),
        title: createEventDto.title,
        description: createEventDto.description,
        startTime: new Date(createEventDto.startTime),
        endTime: new Date(createEventDto.endTime),
        location: createEventDto.location,
        attendees: createEventDto.attendees,
        status: 'confirmed',
        caseId: createEventDto.caseId,
      };

      this.events.set(event.id, event);
      this.logger.log(`Calendar event created: ${event.id}`);

      return event;
    } catch (error: any) {
      this.logger.error('Failed to create calendar event:', error.message);
      throw new BadRequestException('Failed to create calendar event: ' + error.message);
    }
  }

  /**
   * Sync calendar events
   */
  async sync(syncDto: CalendarSyncDto, userId: string): Promise<CalendarEvent[]> {
    this.logger.log('Syncing calendar events:', syncDto);

    try {
      // TODO: Implement actual calendar API sync
      // This would typically sync with Google Calendar, Outlook, etc.
      const fromDate = new Date(syncDto.fromDate);
      const toDate = new Date(syncDto.toDate);

      const events = Array.from(this.events.values()).filter(
        event =>
          event.startTime >= fromDate &&
          event.startTime <= toDate,
      );

      this.logger.log(`Synced ${events.length} calendar events`);
      return events;
    } catch (error: any) {
      this.logger.error('Calendar sync failed:', error.message);
      throw new BadRequestException('Failed to sync calendar: ' + error.message);
    }
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    this.logger.log(`Getting upcoming events for next ${days} days`);

    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return Array.from(this.events.values())
      .filter(event => event.startTime >= now && event.startTime <= futureDate)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Get events for a specific case
   */
  async getEventsByCase(caseId: string): Promise<CalendarEvent[]> {
    this.logger.log(`Getting events for case: ${caseId}`);

    return Array.from(this.events.values())
      .filter(event => event.caseId === caseId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  /**
   * Update calendar event
   */
  async updateEvent(eventId: string, updates: Partial<CreateCalendarEventDto>): Promise<CalendarEvent> {
    this.logger.log(`Updating calendar event: ${eventId}`);

    const event = this.events.get(eventId);
    if (!event) {
      throw new BadRequestException(`Event ${eventId} not found`);
    }

    const updated: CalendarEvent = {
      ...event,
      ...updates,
      startTime: updates.startTime ? new Date(updates.startTime) : event.startTime,
      endTime: updates.endTime ? new Date(updates.endTime) : event.endTime,
    };

    this.events.set(eventId, updated);
    return updated;
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(eventId: string): Promise<void> {
    this.logger.log(`Deleting calendar event: ${eventId}`);

    if (!this.events.has(eventId)) {
      throw new BadRequestException(`Event ${eventId} not found`);
    }

    this.events.delete(eventId);
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `cal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
