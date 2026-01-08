import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeEntry, TimeEntryStatus } from '../time-entries/entities/time-entry.entity';
import { BillingRate } from '../entities/billing-rate.entity';
import { Case } from '@cases/entities/case.entity';
import { User } from '@users/entities/user.entity';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees?: string[];
  location?: string;
  caseId?: string;
  matterId?: string;
}

export interface EmailActivity {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string[];
  cc?: string[];
  timestamp: Date;
  caseId?: string;
  matterId?: string;
  clientId?: string;
}

export interface TimeCaptureSuggestion {
  id: string;
  source: 'calendar' | 'email' | 'document' | 'system';
  sourceId: string;
  userId: string;
  caseId?: string;
  suggestedDate: Date;
  suggestedDuration: number;
  suggestedDescription: string;
  suggestedActivity: string;
  suggestedRate: number;
  confidence: number; // 0-1 scale
  metadata: Record<string, any>;
  createdAt: Date;
  accepted: boolean;
  acceptedAt?: Date;
  timeEntryId?: string;
}

/**
 * Time Entry Capture Service
 *
 * Provides intelligent time capture suggestions based on:
 * - Calendar events (meetings, hearings, court appearances)
 * - Email activity (client communications, legal research)
 * - Document work (drafting, reviewing)
 * - System activity logs
 *
 * Features:
 * - AI-powered activity detection
 * - Automatic rate lookup based on user/case/client
 * - Smart duration calculation
 * - Activity categorization
 * - Batch processing for end-of-day suggestions
 */
@Injectable()
export class TimeEntryCaptureService {
  private readonly logger = new Logger(TimeEntryCaptureService.name);

  // In-memory cache for suggestions (in production, use Redis)
  private suggestions: Map<string, TimeCaptureSuggestion> = new Map();

  constructor(
    @InjectRepository(TimeEntry)
    private readonly timeEntryRepository: Repository<TimeEntry>,
    @InjectRepository(BillingRate)
    private readonly billingRateRepository: Repository<BillingRate>,
    @InjectRepository(Case)
    private readonly caseRepository: Repository<Case>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Generate time entry suggestions from calendar events
   */
  async suggestFromCalendar(
    userId: string,
    events: CalendarEvent[],
  ): Promise<TimeCaptureSuggestion[]> {
    this.logger.log(`Generating time suggestions from ${events.length} calendar events for user ${userId}`);

    const suggestions: TimeCaptureSuggestion[] = [];

    for (const event of events) {
      // Skip all-day events and personal events
      if (this.isAllDayEvent(event) || this.isPersonalEvent(event)) {
        continue;
      }

      // Calculate duration in hours
      const duration = this.calculateDuration(event.startTime, event.endTime);

      // Detect case/matter from event
      const caseId = await this.detectCaseFromEvent(event);

      // Get applicable billing rate
      const rate = await this.getApplicableRate(userId, caseId);

      // Categorize activity
      const activity = this.categorizeActivity(event.title, event.description);

      // Calculate confidence score
      const confidence = this.calculateConfidence(event, caseId, activity);

      const suggestion: TimeCaptureSuggestion = {
        id: this.generateSuggestionId(),
        source: 'calendar',
        sourceId: event.id,
        userId,
        caseId,
        suggestedDate: event.startTime,
        suggestedDuration: duration,
        suggestedDescription: this.generateDescription(event),
        suggestedActivity: activity,
        suggestedRate: rate,
        confidence,
        metadata: {
          eventTitle: event.title,
          eventLocation: event.location,
          attendees: event.attendees,
        },
        createdAt: new Date(),
        accepted: false,
      };

      suggestions.push(suggestion);
      this.suggestions.set(suggestion.id, suggestion);
    }

    return suggestions;
  }

  /**
   * Generate time entry suggestions from email activity
   */
  async suggestFromEmail(
    userId: string,
    emails: EmailActivity[],
  ): Promise<TimeCaptureSuggestion[]> {
    this.logger.log(`Generating time suggestions from ${emails.length} emails for user ${userId}`);

    const suggestions: TimeCaptureSuggestion[] = [];

    // Group emails by case/subject to consolidate time entries
    const emailGroups = this.groupEmailsByCase(emails);

    for (const [caseId, groupedEmails] of emailGroups.entries()) {
      // Estimate time spent on emails (5-10 minutes per email)
      const duration = this.estimateEmailDuration(groupedEmails);

      // Get applicable billing rate
      const rate = await this.getApplicableRate(userId, caseId || undefined);

      // Determine activity
      const activity = 'Email Correspondence';

      // Generate description
      const description = this.generateEmailDescription(groupedEmails);

      const suggestion: TimeCaptureSuggestion = {
        id: this.generateSuggestionId(),
        source: 'email',
        sourceId: groupedEmails.map(e => e.id).join(','),
        userId,
        caseId: caseId || undefined,
        suggestedDate: groupedEmails[0].timestamp,
        suggestedDuration: duration,
        suggestedDescription: description,
        suggestedActivity: activity,
        suggestedRate: rate,
        confidence: caseId ? 0.8 : 0.6,
        metadata: {
          emailCount: groupedEmails.length,
          subjects: groupedEmails.map(e => e.subject),
        },
        createdAt: new Date(),
        accepted: false,
      };

      suggestions.push(suggestion);
      this.suggestions.set(suggestion.id, suggestion);
    }

    return suggestions;
  }

  /**
   * Accept a time capture suggestion and create time entry
   */
  async acceptSuggestion(
    suggestionId: string,
    userId: string,
    modifications?: Partial<TimeEntry>,
  ): Promise<TimeEntry> {
    const suggestion = this.suggestions.get(suggestionId);

    if (!suggestion) {
      throw new Error(`Suggestion ${suggestionId} not found`);
    }

    if (suggestion.userId !== userId) {
      throw new Error(`Suggestion ${suggestionId} does not belong to user ${userId}`);
    }

    // Create time entry
    const total = suggestion.suggestedDuration * suggestion.suggestedRate;

    const timeEntry = this.timeEntryRepository.create({
      userId,
      caseId: suggestion.caseId,
      date: suggestion.suggestedDate,
      duration: suggestion.suggestedDuration,
      description: suggestion.suggestedDescription,
      activity: suggestion.suggestedActivity,
      rate: suggestion.suggestedRate,
      total,
      discountedTotal: total,
      status: TimeEntryStatus.DRAFT,
      billable: true,
      ...modifications,
    });

    const saved = await this.timeEntryRepository.save(timeEntry);

    // Mark suggestion as accepted
    suggestion.accepted = true;
    suggestion.acceptedAt = new Date();
    suggestion.timeEntryId = saved.id;

    this.logger.log(`Accepted suggestion ${suggestionId}, created time entry ${saved.id}`);

    return saved;
  }

  /**
   * Reject a time capture suggestion
   */
  async rejectSuggestion(suggestionId: string): Promise<void> {
    this.suggestions.delete(suggestionId);
    this.logger.log(`Rejected suggestion ${suggestionId}`);
  }

  /**
   * Get pending suggestions for a user
   */
  getPendingSuggestions(userId: string): TimeCaptureSuggestion[] {
    const userSuggestions = Array.from(this.suggestions.values())
      .filter(s => s.userId === userId && !s.accepted)
      .sort((a, b) => b.confidence - a.confidence);

    return userSuggestions;
  }

  /**
   * Get daily time capture suggestions for a user
   */
  async getDailySuggestions(
    userId: string,
    date: Date,
  ): Promise<TimeCaptureSuggestion[]> {
    // In production, integrate with calendar and email APIs
    // For now, return existing suggestions for the date
    return Array.from(this.suggestions.values()).filter(
      s =>
        s.userId === userId &&
        !s.accepted &&
        this.isSameDay(new Date(s.suggestedDate), date),
    );
  }

  /**
   * Calculate duration between two dates in hours
   */
  private calculateDuration(startTime: Date, endTime: Date): number {
    const milliseconds = endTime.getTime() - startTime.getTime();
    const hours = milliseconds / (1000 * 60 * 60);

    // Round to nearest 0.1 hour (6 minutes)
    return Math.round(hours * 10) / 10;
  }

  /**
   * Check if event is all-day
   */
  private isAllDayEvent(event: CalendarEvent): boolean {
    const duration = this.calculateDuration(event.startTime, event.endTime);
    return duration >= 23; // 23+ hours is likely an all-day event
  }

  /**
   * Check if event is personal (non-billable)
   */
  private isPersonalEvent(event: CalendarEvent): boolean {
    const personalKeywords = [
      'personal',
      'lunch',
      'break',
      'vacation',
      'dentist',
      'doctor',
      'birthday',
      'anniversary',
      'holiday',
    ];

    const title = event.title.toLowerCase();
    return personalKeywords.some(keyword => title.includes(keyword));
  }

  /**
   * Detect case from calendar event
   */
  private async detectCaseFromEvent(event: CalendarEvent): Promise<string | undefined> {
    // Check if case ID is in event metadata
    if (event.caseId) {
      return event.caseId;
    }

    if (event.matterId) {
      return event.matterId;
    }

    // Try to extract case number from title or description
    const text = `${event.title} ${event.description || ''}`;
    const caseNumberPattern = /(?:case|matter|file)\s*#?\s*([A-Z0-9-]+)/i;
    const match = text.match(caseNumberPattern);

    if (match) {
      const caseNumber = match[1];
      const caseEntity = await this.caseRepository.findOne({
        where: { caseNumber },
      });

      if (caseEntity) {
        return caseEntity.id;
      }
    }

    return undefined;
  }

  /**
   * Get applicable billing rate for user/case combination
   */
  private async getApplicableRate(userId: string, caseId?: string): Promise<number> {
    // Look for case-specific rate first
    if (caseId) {
      const caseRate = await this.billingRateRepository.findOne({
        where: {
          userId,
          caseId,
          isActive: true,
        },
        order: { priority: 'DESC', effectiveDate: 'DESC' },
      });

      if (caseRate && caseRate.isCurrentlyActive()) {
        return caseRate.getEffectiveRate();
      }
    }

    // Fall back to user standard rate
    const userRate = await this.billingRateRepository.findOne({
      where: {
        userId,
        isActive: true,
      },
      order: { priority: 'DESC', effectiveDate: 'DESC' },
    });

    if (userRate && userRate.isCurrentlyActive()) {
      return userRate.getEffectiveRate();
    }

    // Default rate if no rate found
    return 250.0;
  }

  /**
   * Categorize activity based on event title and description
   */
  private categorizeActivity(title: string, description?: string): string {
    const text = `${title} ${description || ''}`.toLowerCase();

    const activityMap: Record<string, string> = {
      meeting: 'Client Meeting',
      call: 'Phone Conference',
      phone: 'Phone Conference',
      conference: 'Conference',
      hearing: 'Court Hearing',
      trial: 'Trial',
      deposition: 'Deposition',
      mediation: 'Mediation',
      arbitration: 'Arbitration',
      research: 'Legal Research',
      drafting: 'Drafting',
      review: 'Document Review',
      filing: 'Court Filing',
    };

    for (const [keyword, activity] of Object.entries(activityMap)) {
      if (text.includes(keyword)) {
        return activity;
      }
    }

    return 'General Legal Services';
  }

  /**
   * Generate description from calendar event
   */
  private generateDescription(event: CalendarEvent): string {
    let description = event.title;

    if (event.location) {
      description += ` at ${event.location}`;
    }

    if (event.attendees && event.attendees.length > 0) {
      description += ` with ${event.attendees.join(', ')}`;
    }

    if (event.description) {
      description += `. ${event.description}`;
    }

    return description;
  }

  /**
   * Calculate confidence score for suggestion
   */
  private calculateConfidence(
    event: CalendarEvent,
    caseId?: string,
    activity?: string,
  ): number {
    let confidence = 0.5; // Base confidence

    // Higher confidence if case is identified
    if (caseId) {
      confidence += 0.3;
    }

    // Higher confidence for legal-related activities
    const legalKeywords = ['court', 'hearing', 'deposition', 'trial', 'client', 'case'];
    if (legalKeywords.some(keyword => event.title.toLowerCase().includes(keyword))) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Group emails by case for consolidation
   */
  private groupEmailsByCase(emails: EmailActivity[]): Map<string | null, EmailActivity[]> {
    const groups = new Map<string | null, EmailActivity[]>();

    for (const email of emails) {
      const caseId = email.caseId || null;
      if (!groups.has(caseId)) {
        groups.set(caseId, []);
      }
      groups.get(caseId)!.push(email);
    }

    return groups;
  }

  /**
   * Estimate time spent on emails
   */
  private estimateEmailDuration(emails: EmailActivity[]): number {
    // Estimate 5-10 minutes per email
    const avgMinutesPerEmail = 7;
    const totalMinutes = emails.length * avgMinutesPerEmail;
    const hours = totalMinutes / 60;

    // Round to nearest 0.1 hour
    return Math.round(hours * 10) / 10;
  }

  /**
   * Generate description from emails
   */
  private generateEmailDescription(emails: EmailActivity[]): string {
    if (emails.length === 1) {
      return `Email correspondence: ${emails[0].subject}`;
    }

    return `Email correspondence (${emails.length} emails): ${emails
      .slice(0, 3)
      .map(e => e.subject)
      .join('; ')}${emails.length > 3 ? '...' : ''}`;
  }

  /**
   * Check if two dates are the same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  /**
   * Generate unique suggestion ID
   */
  private generateSuggestionId(): string {
    return `SUGGEST-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }
}
