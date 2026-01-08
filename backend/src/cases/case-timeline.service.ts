import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Case } from './entities/case.entity';
import { CaseDeadline } from './entities/case-deadline.entity';

export interface TimelineEvent {
  id: string;
  type: 'filing' | 'deadline' | 'hearing' | 'motion' | 'discovery' | 'milestone' | 'document' | 'note' | 'status_change';
  date: Date;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
  relatedEntityId?: string;
  relatedEntityType?: string;
  metadata?: Record<string, unknown>;
}

export interface CasePhase {
  id: string;
  name: string;
  startDate: Date;
  endDate?: Date;
  status: 'upcoming' | 'active' | 'completed';
  progress: number;
  milestones: TimelineEvent[];
  deadlines: TimelineEvent[];
}

export interface TimelineFilter {
  startDate?: Date;
  endDate?: Date;
  eventTypes?: string[];
  assignedTo?: string;
  status?: string;
}

/**
 * Case Timeline Service
 *
 * Provides comprehensive timeline visualization and management:
 * - Chronological event tracking
 * - Phase-based case progression
 * - Gantt chart data generation
 * - Milestone tracking
 * - Critical path analysis
 * - Timeline filtering and search
 */
@Injectable()
export class CaseTimelineService {
  constructor(
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
    @InjectRepository(CaseDeadline)
    private deadlineRepository: Repository<CaseDeadline>,
  ) {}

  /**
   * Get complete timeline for a case
   */
  async getCaseTimeline(
    caseId: string,
    filter?: TimelineFilter,
  ): Promise<TimelineEvent[]> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    const timeline: TimelineEvent[] = [];

    // Add case filing event
    if (caseEntity.filingDate || caseEntity.dateFiled) {
      timeline.push({
        id: `case-filed-${caseId}`,
        type: 'filing',
        date: caseEntity.filingDate || caseEntity.dateFiled!,
        title: 'Case Filed',
        description: `${caseEntity.title} filed in ${caseEntity.court || 'court'}`,
        metadata: {
          caseNumber: caseEntity.caseNumber,
          court: caseEntity.court,
        },
      });
    }

    // Add deadlines
    const deadlines = await this.getDeadlineEvents(caseId, filter);
    timeline.push(...deadlines);

    // Add trial date if exists
    if (caseEntity.trialDate) {
      timeline.push({
        id: `trial-${caseId}`,
        type: 'hearing',
        date: caseEntity.trialDate,
        title: 'Trial Date',
        description: 'Scheduled trial date',
        priority: 'critical',
        metadata: {
          judge: caseEntity.judge,
        },
      });
    }

    // Add case termination if exists
    if (caseEntity.dateTerminated || caseEntity.closeDate) {
      timeline.push({
        id: `case-terminated-${caseId}`,
        type: 'status_change',
        date: caseEntity.dateTerminated || caseEntity.closeDate!,
        title: 'Case Terminated',
        description: `Case closed with status: ${caseEntity.status}`,
        status: caseEntity.status,
      });
    }

    // Sort by date
    timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Apply filters
    return this.applyTimelineFilters(timeline, filter);
  }

  /**
   * Get deadline events for timeline
   */
  private async getDeadlineEvents(
    caseId: string,
    filter?: TimelineFilter,
  ): Promise<TimelineEvent[]> {
    const queryBuilder = this.deadlineRepository
      .createQueryBuilder('deadline')
      .where('deadline.caseId = :caseId', { caseId });

    if (filter?.startDate) {
      queryBuilder.andWhere('deadline.deadlineDate >= :startDate', {
        startDate: filter.startDate,
      });
    }

    if (filter?.endDate) {
      queryBuilder.andWhere('deadline.deadlineDate <= :endDate', {
        endDate: filter.endDate,
      });
    }

    if (filter?.assignedTo) {
      queryBuilder.andWhere('deadline.assignedTo = :assignedTo', {
        assignedTo: filter.assignedTo,
      });
    }

    const deadlines = await queryBuilder.getMany();

    return deadlines.map((deadline) => ({
      id: deadline.id,
      type: 'deadline' as const,
      date: deadline.deadlineDate,
      title: deadline.title,
      description: deadline.description,
      status: deadline.status,
      priority: deadline.priority,
      assignedTo: deadline.assignedTo,
      relatedEntityId: deadline.id,
      relatedEntityType: 'deadline',
      metadata: {
        deadlineType: deadline.deadlineType,
        ruleCitation: deadline.ruleCitation,
        isCourtImposed: deadline.isCourtImposed,
        isStatutory: deadline.isStatutory,
      },
    }));
  }

  /**
   * Apply filters to timeline events
   */
  private applyTimelineFilters(
    timeline: TimelineEvent[],
    filter?: TimelineFilter,
  ): TimelineEvent[] {
    if (!filter) return timeline;

    return timeline.filter((event) => {
      if (filter.eventTypes && !filter.eventTypes.includes(event.type)) {
        return false;
      }

      if (filter.status && event.status !== filter.status) {
        return false;
      }

      if (filter.assignedTo && event.assignedTo !== filter.assignedTo) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get case phases with milestones
   */
  async getCasePhases(caseId: string): Promise<CasePhase[]> {
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    const timeline = await this.getCaseTimeline(caseId);
    const phases: CasePhase[] = [];

    // Define standard litigation phases
    const phaseDefinitions = [
      { name: 'Pleadings', keywords: ['filing', 'complaint', 'answer', 'motion to dismiss'] },
      { name: 'Discovery', keywords: ['discovery', 'interrogatories', 'deposition', 'production'] },
      { name: 'Motion Practice', keywords: ['motion', 'summary judgment', 'dismiss'] },
      { name: 'Pre-Trial', keywords: ['pretrial', 'settlement', 'mediation', 'conference'] },
      { name: 'Trial', keywords: ['trial', 'jury', 'verdict'] },
      { name: 'Post-Trial', keywords: ['judgment', 'appeal', 'post-trial'] },
    ];

    // Group timeline events into phases
    phaseDefinitions.forEach((phaseDef, index) => {
      const phaseEvents = timeline.filter((event) =>
        phaseDef.keywords.some(
          (keyword) =>
            event.title.toLowerCase().includes(keyword) ||
            event.description?.toLowerCase().includes(keyword),
        ),
      );

      if (phaseEvents.length > 0) {
        const startDate = phaseEvents[0].date;
        const endDate =
          phaseEvents.length > 1
            ? phaseEvents[phaseEvents.length - 1].date
            : undefined;

        const now = new Date();
        let status: 'upcoming' | 'active' | 'completed' = 'upcoming';
        let progress = 0;

        if (startDate <= now) {
          status = 'active';
          if (endDate && endDate <= now) {
            status = 'completed';
            progress = 100;
          } else {
            // Calculate progress based on completed events
            const completedEvents = phaseEvents.filter(
              (e) => e.status === 'completed',
            ).length;
            progress = (completedEvents / phaseEvents.length) * 100;
          }
        }

        phases.push({
          id: `phase-${index}`,
          name: phaseDef.name,
          startDate,
          endDate,
          status,
          progress,
          milestones: phaseEvents.filter((e) => e.type === 'milestone'),
          deadlines: phaseEvents.filter((e) => e.type === 'deadline'),
        });
      }
    });

    return phases;
  }

  /**
   * Get Gantt chart data for case timeline
   */
  async getGanttChartData(caseId: string): Promise<{
    tasks: Array<{
      id: string;
      name: string;
      start: Date;
      end: Date;
      progress: number;
      dependencies?: string[];
      type: string;
      assignedTo?: string;
    }>;
    milestones: Array<{
      id: string;
      name: string;
      date: Date;
      type: string;
    }>;
  }> {
    const phases = await this.getCasePhases(caseId);
    const timeline = await this.getCaseTimeline(caseId);

    const tasks = phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      start: phase.startDate,
      end: phase.endDate || new Date(),
      progress: phase.progress,
      type: 'phase',
    }));

    const milestones = timeline
      .filter(
        (event) =>
          event.type === 'milestone' ||
          event.type === 'filing' ||
          event.priority === 'critical',
      )
      .map((event) => ({
        id: event.id,
        name: event.title,
        date: event.date,
        type: event.type,
      }));

    return { tasks, milestones };
  }

  /**
   * Get critical path for the case
   */
  async getCriticalPath(caseId: string): Promise<TimelineEvent[]> {
    const timeline = await this.getCaseTimeline(caseId);

    // Filter to only critical events
    return timeline.filter(
      (event) =>
        event.priority === 'critical' ||
        event.type === 'filing' ||
        event.type === 'hearing' ||
        (event.type === 'deadline' &&
          (event.metadata?.isCourtImposed || event.metadata?.isStatutory)),
    );
  }

  /**
   * Add a custom timeline event
   */
  async addTimelineEvent(
    caseId: string,
    event: Omit<TimelineEvent, 'id'>,
  ): Promise<TimelineEvent> {
    // Verify case exists
    const caseEntity = await this.caseRepository.findOne({
      where: { id: caseId },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case ${caseId} not found`);
    }

    // For now, we'll store custom events in the case metadata
    // In a production system, you'd want a separate timeline_events table
    const customEvent: TimelineEvent = {
      id: `custom-${Date.now()}`,
      ...event,
    };

    const metadata = caseEntity.metadata || {};
    const timelineEvents = (metadata.timelineEvents as TimelineEvent[]) || [];
    timelineEvents.push(customEvent);

    caseEntity.metadata = {
      ...metadata,
      timelineEvents,
    };

    await this.caseRepository.save(caseEntity);

    return customEvent;
  }

  /**
   * Get timeline statistics
   */
  async getTimelineStatistics(caseId: string): Promise<{
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    overdueEvents: number;
    averageEventDuration: number;
    phaseProgress: number;
  }> {
    const timeline = await this.getCaseTimeline(caseId);
    const phases = await this.getCasePhases(caseId);

    const now = new Date();

    const completedEvents = timeline.filter(
      (e) => e.status === 'completed' || e.date < now,
    ).length;

    const upcomingEvents = timeline.filter((e) => e.date >= now).length;

    const overdueEvents = timeline.filter(
      (e) =>
        e.type === 'deadline' &&
        e.date < now &&
        e.status !== 'completed',
    ).length;

    const totalProgress = phases.reduce((sum, phase) => sum + phase.progress, 0);
    const phaseProgress = phases.length > 0 ? totalProgress / phases.length : 0;

    return {
      totalEvents: timeline.length,
      completedEvents,
      upcomingEvents,
      overdueEvents,
      averageEventDuration: 0, // Would calculate based on actual event durations
      phaseProgress,
    };
  }

  /**
   * Export timeline to structured format
   */
  async exportTimeline(caseId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    const timeline = await this.getCaseTimeline(caseId);

    if (format === 'json') {
      return JSON.stringify(timeline, null, 2);
    }

    // CSV format
    const headers = ['ID', 'Type', 'Date', 'Title', 'Description', 'Status', 'Priority'];
    const rows = timeline.map((event) => [
      event.id,
      event.type,
      event.date.toISOString(),
      event.title,
      event.description || '',
      event.status || '',
      event.priority || '',
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}
