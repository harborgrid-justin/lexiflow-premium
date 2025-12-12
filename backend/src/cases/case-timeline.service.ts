import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { CaseTimelineEvent, TimelineEventType } from './entities/case-timeline.entity';
import { CreateTimelineEventDto, TimelineEventResponseDto } from './dto/case-timeline.dto';

@Injectable()
export class CaseTimelineService {
  constructor(
    @InjectRepository(CaseTimelineEvent)
    private readonly timelineRepository: Repository<CaseTimelineEvent>,
  ) {}

  /**
   * Find all timeline events for a case
   */
  async findByCaseId(
    caseId: string,
    options?: {
      eventType?: TimelineEventType;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    },
  ): Promise<TimelineEventResponseDto[]> {
    const queryBuilder = this.timelineRepository
      .createQueryBuilder('timeline')
      .where('timeline.caseId = :caseId', { caseId });

    // Filter by event type
    if (options?.eventType) {
      queryBuilder.andWhere('timeline.eventType = :eventType', {
        eventType: options.eventType,
      });
    }

    // Filter by date range
    if (options?.startDate && options?.endDate) {
      queryBuilder.andWhere('timeline.eventDate BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });
    } else if (options?.startDate) {
      queryBuilder.andWhere('timeline.eventDate >= :startDate', {
        startDate: options.startDate,
      });
    } else if (options?.endDate) {
      queryBuilder.andWhere('timeline.eventDate <= :endDate', {
        endDate: options.endDate,
      });
    }

    // Order by event date descending
    queryBuilder.orderBy('timeline.eventDate', 'DESC');

    // Apply limit if specified
    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    const events = await queryBuilder.getMany();
    return events.map((event) => this.toTimelineResponse(event));
  }

  /**
   * Create a timeline event
   */
  async create(createDto: CreateTimelineEventDto): Promise<TimelineEventResponseDto> {
    const event = this.timelineRepository.create(createDto);
    const savedEvent = await this.timelineRepository.save(event);
    return this.toTimelineResponse(savedEvent);
  }

  /**
   * Create multiple timeline events in bulk
   */
  async createBulk(
    createDtos: CreateTimelineEventDto[],
  ): Promise<TimelineEventResponseDto[]> {
    const events = this.timelineRepository.create(createDtos);
    const savedEvents = await this.timelineRepository.save(events);
    return savedEvents.map((event) => this.toTimelineResponse(event));
  }

  /**
   * Log a status change event
   */
  async logStatusChange(
    caseId: string,
    oldStatus: string,
    newStatus: string,
    userId?: string,
    userName?: string,
  ): Promise<TimelineEventResponseDto> {
    return this.create({
      caseId,
      eventType: TimelineEventType.STATUS_CHANGED,
      title: `Case status changed to ${newStatus}`,
      description: `Status updated from ${oldStatus} to ${newStatus}`,
      userId,
      userName,
      changes: [
        {
          field: 'status',
          oldValue: oldStatus,
          newValue: newStatus,
        },
      ],
      metadata: {
        oldStatus,
        newStatus,
      },
    });
  }

  /**
   * Log a team assignment event
   */
  async logTeamAssignment(
    caseId: string,
    memberName: string,
    role: string,
    userId?: string,
    userName?: string,
  ): Promise<TimelineEventResponseDto> {
    return this.create({
      caseId,
      eventType: TimelineEventType.TEAM_MEMBER_ASSIGNED,
      title: `${memberName} assigned as ${role}`,
      description: `Team member ${memberName} was assigned to the case`,
      userId,
      userName,
      metadata: {
        memberName,
        role,
      },
    });
  }

  /**
   * Log a document upload event
   */
  async logDocumentUpload(
    caseId: string,
    documentName: string,
    documentType: string,
    userId?: string,
    userName?: string,
  ): Promise<TimelineEventResponseDto> {
    return this.create({
      caseId,
      eventType: TimelineEventType.DOCUMENT_UPLOADED,
      title: `Document uploaded: ${documentName}`,
      description: `A new ${documentType} document was uploaded`,
      userId,
      userName,
      metadata: {
        documentName,
        documentType,
      },
    });
  }

  /**
   * Log a motion filing event
   */
  async logMotionFiled(
    caseId: string,
    motionTitle: string,
    motionType: string,
    userId?: string,
    userName?: string,
  ): Promise<TimelineEventResponseDto> {
    return this.create({
      caseId,
      eventType: TimelineEventType.MOTION_FILED,
      title: `Motion filed: ${motionTitle}`,
      description: `A ${motionType} was filed`,
      userId,
      userName,
      metadata: {
        motionTitle,
        motionType,
      },
    });
  }

  /**
   * Delete a timeline event
   */
  async remove(id: string): Promise<void> {
    const event = await this.timelineRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException(`Timeline event with ID ${id} not found`);
    }
    await this.timelineRepository.softDelete(id);
  }

  /**
   * Get timeline statistics for a case
   */
  async getStatistics(caseId: string): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentActivityCount: number;
  }> {
    const events = await this.timelineRepository.find({
      where: { caseId },
    });

    const eventsByType: Record<string, number> = {};
    events.forEach((event) => {
      eventsByType[event.eventType] = (eventsByType[event.eventType] || 0) + 1;
    });

    // Count events in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentEvents = events.filter(
      (event) => new Date(event.eventDate) >= sevenDaysAgo,
    );

    return {
      totalEvents: events.length,
      eventsByType,
      recentActivityCount: recentEvents.length,
    };
  }

  private toTimelineResponse(event: CaseTimelineEvent): TimelineEventResponseDto {
    return {
      id: event.id,
      caseId: event.caseId,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      userId: event.userId,
      userName: event.userName,
      metadata: event.metadata,
      changes: event.changes,
      eventDate: event.eventDate,
      createdAt: event.createdAt,
    };
  }
}
