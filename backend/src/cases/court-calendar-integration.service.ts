import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { CaseDeadline } from './entities/case-deadline.entity';

export interface CourtCalendarEvent {
  id: string;
  eventType: 'hearing' | 'filing_deadline' | 'trial' | 'conference' | 'status_conference' | 'motion_hearing';
  eventDate: Date;
  eventTime?: string;
  title: string;
  description?: string;
  courtroom?: string;
  judge?: string;
  caseNumber: string;
  partyNames?: string[];
  docketEntryId?: string;
  reminderDays?: number[];
}

export interface CourtCalendarSync {
  courtId: string;
  courtName: string;
  lastSyncDate: Date;
  nextSyncDate: Date;
  eventsImported: number;
  errors?: string[];
}

/**
 * Court Calendar Integration Service
 *
 * Provides integration with court calendar systems:
 * - PACER integration for federal courts
 * - State court system integrations
 * - Calendar event synchronization
 * - Automated deadline creation from court events
 * - Reminder notifications
 * - iCalendar feed generation
 */
@Injectable()
export class CourtCalendarIntegrationService {
  private readonly logger = new Logger(CourtCalendarIntegrationService.name);

  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(CaseDeadline)
    private deadlineRepository: Repository<CaseDeadline>,
  ) {}

  /**
   * Sync calendar events from PACER (federal courts)
   */
  async syncPacerCalendar(
    caseId: string,
    pacerCaseNumber: string,
    courtId: string,
  ): Promise<CourtCalendarSync> {
    this.logger.log(`Syncing PACER calendar for case ${caseId}`);

    try {
      // In production, this would connect to PACER API
      // For now, returning a mock sync result
      const syncResult: CourtCalendarSync = {
        courtId,
        courtName: 'U.S. District Court',
        lastSyncDate: new Date(),
        nextSyncDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next day
        eventsImported: 0,
      };

      // Mock: Fetch calendar events from PACER
      // const events = await this.fetchPacerEvents(pacerCaseNumber, courtId);
      const events: CourtCalendarEvent[] = [];

      // Import events and create deadlines
      for (const event of events) {
        await this.importCourtEvent(caseId, event);
        syncResult.eventsImported++;
      }

      this.logger.log(
        `PACER sync completed: ${syncResult.eventsImported} events imported`,
      );

      return syncResult;
    } catch (error) {
      this.logger.error(`Failed to sync PACER calendar: ${error}`);
      throw error;
    }
  }

  /**
   * Sync calendar events from state court systems
   */
  async syncStateCourtCalendar(
    caseId: string,
    stateCaseNumber: string,
    courtId: string,
    stateCode: string,
  ): Promise<CourtCalendarSync> {
    this.logger.log(
      `Syncing state court calendar for case ${caseId} in ${stateCode}`,
    );

    try {
      const syncResult: CourtCalendarSync = {
        courtId,
        courtName: `${stateCode} State Court`,
        lastSyncDate: new Date(),
        nextSyncDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        eventsImported: 0,
      };

      // State-specific integrations would go here
      // Different states have different systems (e.g., California - Odyssey, New York - NYSCEF)
      switch (stateCode.toUpperCase()) {
        case 'CA':
          // await this.syncCaliforniaOdyssey(caseId, stateCaseNumber);
          break;
        case 'NY':
          // await this.syncNYSCEF(caseId, stateCaseNumber);
          break;
        case 'TX':
          // await this.syncTexaseCourts(caseId, stateCaseNumber);
          break;
        default:
          this.logger.warn(`No integration available for state: ${stateCode}`);
      }

      return syncResult;
    } catch (error) {
      this.logger.error(`Failed to sync state court calendar: ${error}`);
      throw error;
    }
  }

  /**
   * Import a court calendar event and create corresponding deadline
   */
  async importCourtEvent(
    caseId: string,
    event: CourtCalendarEvent,
  ): Promise<CaseDeadline | null> {
    try {
      // Check if event already imported
      const existing = await this.deadlineRepository.findOne({
        where: {
          caseId,
          title: event.title,
          deadlineDate: event.eventDate,
        },
      });

      if (existing) {
        this.logger.debug(`Event already imported: ${event.title}`);
        return existing;
      }

      // Create deadline from court event
      const deadline = this.deadlineRepository.create({
        caseId,
        title: event.title,
        description: event.description,
        deadlineDate: event.eventDate,
        deadlineType: this.mapEventTypeToDeadlineType(event.eventType),
        status: 'pending',
        priority: this.determineEventPriority(event.eventType),
        isCourtImposed: true,
        isStatutory: false,
        businessDaysOnly: false,
        reminderDates: this.calculateEventReminders(
          event.eventDate,
          event.reminderDays,
        ),
        metadata: {
          courtEvent: true,
          eventType: event.eventType,
          courtroom: event.courtroom,
          judge: event.judge,
          docketEntryId: event.docketEntryId,
        },
      });

      const saved = await this.deadlineRepository.save(deadline);
      this.logger.log(`Imported court event: ${event.title}`);

      return saved;
    } catch (error) {
      this.logger.error(`Failed to import court event: ${error}`);
      return null;
    }
  }

  /**
   * Generate iCalendar feed for case deadlines
   */
  async generateICalendarFeed(caseId: string): Promise<string> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseEntity) {
      throw new Error(`Case ${caseId} not found`);
    }

    const deadlines = await this.deadlineRepository.find({
      where: { caseId },
      order: { deadlineDate: 'ASC' },
    });

    // Generate iCalendar format
    const icalLines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//LexiFlow//Case Calendar//EN',
      `X-WR-CALNAME:${caseEntity.title}`,
      'X-WR-TIMEZONE:America/New_York',
    ];

    for (const deadline of deadlines) {
      const dtstart = this.formatICalDate(deadline.deadlineDate);
      const dtend = this.formatICalDate(
        new Date(deadline.deadlineDate.getTime() + 60 * 60 * 1000),
      ); // 1 hour later
      const uid = `deadline-${deadline.id}@lexiflow.com`;
      const summary = deadline.title;
      const description = deadline.description || '';

      icalLines.push(
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${this.formatICalDate(new Date())}`,
        `DTSTART:${dtstart}`,
        `DTEND:${dtend}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `STATUS:${deadline.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`,
        `PRIORITY:${this.mapPriorityToICal(deadline.priority)}`,
        'END:VEVENT',
      );

      // Add reminders
      if (deadline.reminderDates && deadline.reminderDates.length > 0) {
        for (const reminderDate of deadline.reminderDates) {
          icalLines.push(
            'BEGIN:VALARM',
            'ACTION:DISPLAY',
            `TRIGGER:${this.formatICalDate(new Date(reminderDate))}`,
            `DESCRIPTION:Reminder: ${summary}`,
            'END:VALARM',
          );
        }
      }
    }

    icalLines.push('END:VCALENDAR');

    return icalLines.join('\r\n');
  }

  /**
   * Subscribe to court calendar updates via webhook
   */
  async subscribeToCourtCalendar(
    caseId: string,
    courtId: string,
    webhookUrl: string,
  ): Promise<{ subscriptionId: string; status: string }> {
    this.logger.log(`Subscribing to court calendar updates for case ${caseId}`);

    // In production, this would register a webhook with the court system
    return {
      subscriptionId: `sub-${Date.now()}`,
      status: 'active',
    };
  }

  /**
   * Process incoming webhook from court calendar system
   */
  async processCourtCalendarWebhook(payload: any): Promise<void> {
    this.logger.log('Processing court calendar webhook');

    try {
      // Parse webhook payload
      const { caseNumber, eventType, eventDate, eventDetails } = payload;

      // Find matching case
      const caseEntity = await this.caseRepository.findOne({
        where: { caseNumber },
      });

      if (!caseEntity) {
        this.logger.warn(`No case found for case number: ${caseNumber}`);
        return;
      }

      // Create event from webhook data
      const event: CourtCalendarEvent = {
        id: payload.eventId,
        eventType,
        eventDate: new Date(eventDate),
        title: payload.eventTitle,
        description: eventDetails,
        caseNumber,
      };

      // Import the event
      await this.importCourtEvent(caseEntity.id, event);
    } catch (error) {
      this.logger.error(`Failed to process court calendar webhook: ${error}`);
      throw error;
    }
  }

  /**
   * Map court event type to deadline type
   */
  private mapEventTypeToDeadlineType(eventType: string): string {
    const mapping: Record<string, string> = {
      hearing: 'hearing',
      filing_deadline: 'filing',
      trial: 'trial',
      conference: 'pretrial',
      status_conference: 'pretrial',
      motion_hearing: 'motion',
    };

    return mapping[eventType] || 'custom';
  }

  /**
   * Determine event priority based on type
   */
  private determineEventPriority(eventType: string): string {
    const highPriority = ['trial', 'hearing', 'filing_deadline'];
    const mediumPriority = ['motion_hearing', 'status_conference'];

    if (highPriority.includes(eventType)) return 'high';
    if (mediumPriority.includes(eventType)) return 'medium';
    return 'low';
  }

  /**
   * Calculate reminder dates for court event
   */
  private calculateEventReminders(
    eventDate: Date,
    reminderDays?: number[],
  ): Date[] {
    const defaultReminderDays = reminderDays || [7, 3, 1]; // 7, 3, 1 days before
    const reminders: Date[] = [];

    for (const days of defaultReminderDays) {
      const reminderDate = new Date(eventDate);
      reminderDate.setDate(reminderDate.getDate() - days);

      if (reminderDate > new Date()) {
        reminders.push(reminderDate);
      }
    }

    return reminders;
  }

  /**
   * Format date for iCalendar format (YYYYMMDDTHHMMSSZ)
   */
  private formatICalDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');

    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  }

  /**
   * Map priority to iCalendar priority (1-9, 1 is highest)
   */
  private mapPriorityToICal(priority: string): number {
    const mapping: Record<string, number> = {
      critical: 1,
      high: 3,
      medium: 5,
      low: 7,
    };

    return mapping[priority] || 5;
  }

  /**
   * Get all upcoming court events for a case
   */
  async getUpcomingCourtEvents(caseId: string, days: number = 30): Promise<CaseDeadline[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.deadlineRepository
      .createQueryBuilder('deadline')
      .where('deadline.caseId = :caseId', { caseId })
      .andWhere('deadline.isCourtImposed = :isCourtImposed', {
        isCourtImposed: true,
      })
      .andWhere('deadline.deadlineDate BETWEEN :now AND :futureDate', {
        now,
        futureDate,
      })
      .andWhere('deadline.status != :completed', { completed: 'completed' })
      .orderBy('deadline.deadlineDate', 'ASC')
      .getMany();
  }
}
