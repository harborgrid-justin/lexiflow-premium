import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { MotionDeadline, DeadlineStatus, DeadlineType } from './entities/motion-deadline.entity';

export interface CreateDeadlineDto {
  motionId: string;
  type: DeadlineType;
  title: string;
  description?: string;
  dueDate: Date;
  assignedToUserId?: string;
  assignedToUserName?: string;
  reminderDaysBefore?: number;
  metadata?: Record<string, any>;
}

export interface DeadlineAlert {
  deadline: MotionDeadline;
  daysUntilDue: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
}

@Injectable()
export class DeadlineTrackingService {
  constructor(
    @InjectRepository(MotionDeadline)
    private readonly deadlineRepository: Repository<MotionDeadline>,
  ) {}

  /**
   * Create a new deadline
   */
  async create(createDto: CreateDeadlineDto): Promise<MotionDeadline> {
    const deadline = this.deadlineRepository.create({
      ...createDto,
      status: this.calculateDeadlineStatus(createDto.dueDate),
      reminderDaysBefore: createDto.reminderDaysBefore || 3,
    });

    return this.deadlineRepository.save(deadline);
  }

  /**
   * Get all deadlines for a motion
   */
  async findByMotionId(motionId: string): Promise<MotionDeadline[]> {
    const deadlines = await this.deadlineRepository.find({
      where: { motionId },
      order: { dueDate: 'ASC' },
    });

    // Update statuses based on current date
    return Promise.all(
      deadlines.map(async (deadline) => {
        const currentStatus = this.calculateDeadlineStatus(deadline.dueDate);
        if (currentStatus !== deadline.status && deadline.status !== DeadlineStatus.COMPLETED) {
          deadline.status = currentStatus;
          return this.deadlineRepository.save(deadline);
        }
        return deadline;
      }),
    );
  }

  /**
   * Get all deadlines for a case
   */
  async findByCaseId(caseId: string): Promise<MotionDeadline[]> {
    const deadlines = await this.deadlineRepository
      .createQueryBuilder('deadline')
      .leftJoinAndSelect('deadline.motion', 'motion')
      .where('motion.caseId = :caseId', { caseId })
      .orderBy('deadline.dueDate', 'ASC')
      .getMany();

    return deadlines;
  }

  /**
   * Get upcoming deadlines within specified days
   */
  async getUpcomingDeadlines(days: number = 7, userId?: string): Promise<MotionDeadline[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const queryBuilder = this.deadlineRepository
      .createQueryBuilder('deadline')
      .leftJoinAndSelect('deadline.motion', 'motion')
      .where('deadline.dueDate BETWEEN :now AND :futureDate', { now, futureDate })
      .andWhere('deadline.status != :completed', { completed: DeadlineStatus.COMPLETED })
      .orderBy('deadline.dueDate', 'ASC');

    if (userId) {
      queryBuilder.andWhere('deadline.assignedToUserId = :userId', { userId });
    }

    return queryBuilder.getMany();
  }

  /**
   * Get overdue deadlines
   */
  async getOverdueDeadlines(userId?: string): Promise<MotionDeadline[]> {
    const now = new Date();

    const queryBuilder = this.deadlineRepository
      .createQueryBuilder('deadline')
      .leftJoinAndSelect('deadline.motion', 'motion')
      .where('deadline.dueDate < :now', { now })
      .andWhere('deadline.status != :completed', { completed: DeadlineStatus.COMPLETED })
      .orderBy('deadline.dueDate', 'ASC');

    if (userId) {
      queryBuilder.andWhere('deadline.assignedToUserId = :userId', { userId });
    }

    const deadlines = await queryBuilder.getMany();

    // Update their status to overdue
    return Promise.all(
      deadlines.map(async (deadline) => {
        if (deadline.status !== DeadlineStatus.OVERDUE) {
          deadline.status = DeadlineStatus.OVERDUE;
          return this.deadlineRepository.save(deadline);
        }
        return deadline;
      }),
    );
  }

  /**
   * Mark deadline as completed
   */
  async completeDeadline(
    id: string,
    completedByUserId: string,
    completionNotes?: string,
  ): Promise<MotionDeadline> {
    const deadline = await this.deadlineRepository.findOne({ where: { id } });

    if (!deadline) {
      throw new NotFoundException(`Deadline with ID ${id} not found`);
    }

    deadline.status = DeadlineStatus.COMPLETED;
    deadline.completedDate = new Date();
    deadline.completedByUserId = completedByUserId;
    deadline.completionNotes = completionNotes;

    return this.deadlineRepository.save(deadline);
  }

  /**
   * Get deadline alerts for user
   */
  async getDeadlineAlerts(userId?: string, days: number = 7): Promise<DeadlineAlert[]> {
    const upcoming = await this.getUpcomingDeadlines(days, userId);
    const overdue = await this.getOverdueDeadlines(userId);

    const alerts: DeadlineAlert[] = [];

    // Process overdue deadlines
    overdue.forEach((deadline) => {
      const daysOverdue = Math.floor(
        (new Date().getTime() - new Date(deadline.dueDate).getTime()) / (1000 * 60 * 60 * 24),
      );

      alerts.push({
        deadline,
        daysUntilDue: -daysOverdue,
        severity: 'critical',
        message: `OVERDUE by ${daysOverdue} day(s): ${deadline.title}`,
      });
    });

    // Process upcoming deadlines
    upcoming.forEach((deadline) => {
      const daysUntil = Math.floor(
        (new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
      );

      let severity: 'critical' | 'warning' | 'info' = 'info';
      let message = `${deadline.title} due in ${daysUntil} day(s)`;

      if (daysUntil <= 1) {
        severity = 'critical';
        message = `URGENT: ${deadline.title} due ${daysUntil === 0 ? 'today' : 'tomorrow'}`;
      } else if (daysUntil <= 3) {
        severity = 'warning';
      }

      alerts.push({
        deadline,
        daysUntilDue: daysUntil,
        severity,
        message,
      });
    });

    return alerts.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Get deadline statistics for a case or user
   */
  async getDeadlineStatistics(params: {
    caseId?: string;
    userId?: string;
  }): Promise<{
    total: number;
    upcoming: number;
    overdue: number;
    completed: number;
    dueSoon: number;
  }> {
    const queryBuilder = this.deadlineRepository.createQueryBuilder('deadline');

    if (params.caseId) {
      queryBuilder
        .leftJoin('deadline.motion', 'motion')
        .where('motion.caseId = :caseId', { caseId: params.caseId });
    }

    if (params.userId) {
      queryBuilder.andWhere('deadline.assignedToUserId = :userId', { userId: params.userId });
    }

    const all = await queryBuilder.getMany();

    return {
      total: all.length,
      upcoming: all.filter((d) => d.status === DeadlineStatus.UPCOMING).length,
      overdue: all.filter((d) => d.status === DeadlineStatus.OVERDUE).length,
      completed: all.filter((d) => d.status === DeadlineStatus.COMPLETED).length,
      dueSoon: all.filter((d) => d.status === DeadlineStatus.DUE_SOON).length,
    };
  }

  /**
   * Calculate deadline status based on due date
   */
  private calculateDeadlineStatus(dueDate: Date): DeadlineStatus {
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntil = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) {
      return DeadlineStatus.OVERDUE;
    } else if (daysUntil <= 3) {
      return DeadlineStatus.DUE_SOON;
    } else {
      return DeadlineStatus.UPCOMING;
    }
  }

  /**
   * Delete a deadline
   */
  async remove(id: string): Promise<void> {
    const deadline = await this.deadlineRepository.findOne({ where: { id } });
    if (!deadline) {
      throw new NotFoundException(`Deadline with ID ${id} not found`);
    }
    await this.deadlineRepository.softDelete(id);
  }
}
