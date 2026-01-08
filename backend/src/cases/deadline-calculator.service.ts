import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CaseDeadline, DeadlineStatus, DeadlineType, DeadlinePriority } from './entities/case-deadline.entity';
import { DeadlineRule, CalculationMethod } from '@jurisdictions/entities/deadline-rule.entity';
import { Case } from './entities/case.entity';

export interface DeadlineCalculationRequest {
  caseId: string;
  jurisdictionId: string;
  deadlineRuleId?: string;
  triggerEvent: string;
  triggerDate: Date;
  customDaysCount?: number;
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
  assignedTo?: string;
  assignedTeamId?: string;
  notes?: string;
}

export interface CalculatedDeadline {
  deadlineDate: Date;
  businessDaysOnly: boolean;
  excludedDates: Date[];
  daysFromTrigger: number;
  ruleCitation?: string;
  ruleDescription?: string;
}

export interface FederalHoliday {
  name: string;
  date: Date;
}

/**
 * Deadline Calculator Service
 *
 * Provides jurisdiction-specific deadline calculation with:
 * - Business days vs calendar days calculation
 * - Holiday exclusions (federal, state, court-specific)
 * - Automatic deadline creation from rules
 * - Deadline extension management
 * - Reminder scheduling
 * - Multi-jurisdiction support
 */
@Injectable()
export class DeadlineCalculatorService {
  constructor(
    @InjectRepository(CaseDeadline)
    private deadlineRepository: Repository<CaseDeadline>,
    @InjectRepository(DeadlineRule)
    private deadlineRuleRepository: Repository<DeadlineRule>,
    @InjectRepository(Case)
    private caseRepository: Repository<Case>,
  ) {}

  /**
   * Calculate deadline based on jurisdiction rules
   */
  async calculateDeadline(
    request: DeadlineCalculationRequest,
  ): Promise<CalculatedDeadline> {
    let rule: DeadlineRule | null = null;

    // Get the deadline rule if specified
    if (request.deadlineRuleId) {
      rule = await this.deadlineRuleRepository.findOne({
        where: { id: request.deadlineRuleId, isActive: true },
      });

      if (!rule) {
        throw new NotFoundException(
          `Deadline rule ${request.deadlineRuleId} not found`,
        );
      }
    }

    // Determine calculation parameters
    const daysCount = rule?.daysCount || request.customDaysCount || 30;
    const businessDaysOnly =
      rule?.businessDaysOnly || request.excludeWeekends || false;
    const excludeHolidays = rule?.excludeFederalHolidays || request.excludeHolidays || false;

    // Get holidays if needed
    const holidays = excludeHolidays
      ? await this.getFederalHolidays(
          request.triggerDate.getFullYear(),
        )
      : [];

    const excludedDates = [
      ...(rule?.excludedDates || []).map((d) => new Date(d)),
      ...holidays.map((h) => h.date),
    ];

    // Calculate the deadline date
    const deadlineDate = this.calculateDate(
      request.triggerDate,
      daysCount,
      businessDaysOnly,
      excludedDates,
    );

    return {
      deadlineDate,
      businessDaysOnly,
      excludedDates,
      daysFromTrigger: daysCount,
      ruleCitation: rule?.ruleCitation,
      ruleDescription: rule?.summary,
    };
  }

  /**
   * Create a deadline from a calculation request
   */
  async createDeadlineFromCalculation(
    request: DeadlineCalculationRequest,
    title: string,
    description?: string,
    deadlineType: DeadlineType = DeadlineType.CUSTOM,
    priority: DeadlinePriority = DeadlinePriority.MEDIUM,
  ): Promise<CaseDeadline> {
    // Verify case exists
    const caseEntity = await this.caseRepository.findOne({
      where: { id: request.caseId },
    });

    if (!caseEntity) {
      throw new NotFoundException(`Case ${request.caseId} not found`);
    }

    // Calculate the deadline
    const calculation = await this.calculateDeadline(request);

    // Create the deadline entity
    const deadline = this.deadlineRepository.create({
      caseId: request.caseId,
      title,
      description,
      deadlineType,
      deadlineDate: calculation.deadlineDate,
      originalDeadlineDate: calculation.deadlineDate,
      status: DeadlineStatus.PENDING,
      priority,
      jurisdictionRuleId: request.deadlineRuleId,
      ruleCitation: calculation.ruleCitation,
      triggerEvent: request.triggerEvent,
      triggerDate: request.triggerDate,
      daysFromTrigger: calculation.daysFromTrigger,
      businessDaysOnly: calculation.businessDaysOnly,
      excludedDates: calculation.excludedDates,
      assignedTo: request.assignedTo,
      assignedTeamId: request.assignedTeamId,
      notes: request.notes,
      reminderDates: this.calculateReminderDates(calculation.deadlineDate),
    });

    return this.deadlineRepository.save(deadline);
  }

  /**
   * Calculate a date forward from a trigger date
   */
  private calculateDate(
    triggerDate: Date,
    daysCount: number,
    businessDaysOnly: boolean,
    excludedDates: Date[],
  ): Date {
    const result = new Date(triggerDate);
    let remainingDays = daysCount;

    const excludedDateStrings = excludedDates.map((d) =>
      new Date(d).toDateString(),
    );

    while (remainingDays > 0) {
      result.setDate(result.getDate() + 1);

      const dayOfWeek = result.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isExcluded = excludedDateStrings.includes(result.toDateString());

      if (businessDaysOnly) {
        // Only count business days
        if (!isWeekend && !isExcluded) {
          remainingDays--;
        }
      } else {
        // Count all days except excluded
        if (!isExcluded) {
          remainingDays--;
        }
      }
    }

    // If the final date is excluded, move to next valid day
    while (excludedDateStrings.includes(result.toDateString())) {
      result.setDate(result.getDate() + 1);
      if (businessDaysOnly && (result.getDay() === 0 || result.getDay() === 6)) {
        continue;
      }
      break;
    }

    return result;
  }

  /**
   * Calculate reminder dates (7 days, 3 days, 1 day before deadline)
   */
  private calculateReminderDates(deadlineDate: Date): Date[] {
    const reminders: Date[] = [];
    const deadline = new Date(deadlineDate);

    // 7 days before
    const sevenDaysBefore = new Date(deadline);
    sevenDaysBefore.setDate(deadline.getDate() - 7);
    if (sevenDaysBefore > new Date()) {
      reminders.push(sevenDaysBefore);
    }

    // 3 days before
    const threeDaysBefore = new Date(deadline);
    threeDaysBefore.setDate(deadline.getDate() - 3);
    if (threeDaysBefore > new Date()) {
      reminders.push(threeDaysBefore);
    }

    // 1 day before
    const oneDayBefore = new Date(deadline);
    oneDayBefore.setDate(deadline.getDate() - 1);
    if (oneDayBefore > new Date()) {
      reminders.push(oneDayBefore);
    }

    return reminders;
  }

  /**
   * Get federal holidays for a given year
   */
  private async getFederalHolidays(year: number): Promise<FederalHoliday[]> {
    // This would typically come from a database or external API
    // For now, returning the standard US federal holidays
    const holidays: FederalHoliday[] = [];

    // New Year's Day
    holidays.push({ name: "New Year's Day", date: new Date(year, 0, 1) });

    // Martin Luther King Jr. Day (3rd Monday in January)
    holidays.push({
      name: "Martin Luther King Jr. Day",
      date: this.getNthWeekdayOfMonth(year, 0, 1, 3),
    });

    // Presidents' Day (3rd Monday in February)
    holidays.push({
      name: "Presidents' Day",
      date: this.getNthWeekdayOfMonth(year, 1, 1, 3),
    });

    // Memorial Day (Last Monday in May)
    holidays.push({
      name: "Memorial Day",
      date: this.getLastWeekdayOfMonth(year, 4, 1),
    });

    // Juneteenth
    holidays.push({ name: "Juneteenth", date: new Date(year, 5, 19) });

    // Independence Day
    holidays.push({ name: "Independence Day", date: new Date(year, 6, 4) });

    // Labor Day (1st Monday in September)
    holidays.push({
      name: "Labor Day",
      date: this.getNthWeekdayOfMonth(year, 8, 1, 1),
    });

    // Columbus Day (2nd Monday in October)
    holidays.push({
      name: "Columbus Day",
      date: this.getNthWeekdayOfMonth(year, 9, 1, 2),
    });

    // Veterans Day
    holidays.push({ name: "Veterans Day", date: new Date(year, 10, 11) });

    // Thanksgiving Day (4th Thursday in November)
    holidays.push({
      name: "Thanksgiving Day",
      date: this.getNthWeekdayOfMonth(year, 10, 4, 4),
    });

    // Christmas Day
    holidays.push({ name: "Christmas Day", date: new Date(year, 11, 25) });

    return holidays;
  }

  /**
   * Get the nth occurrence of a weekday in a month
   */
  private getNthWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number,
    n: number,
  ): Date {
    const date = new Date(year, month, 1);
    let count = 0;

    while (date.getMonth() === month) {
      if (date.getDay() === weekday) {
        count++;
        if (count === n) {
          return new Date(date);
        }
      }
      date.setDate(date.getDate() + 1);
    }

    return new Date(year, month, 1);
  }

  /**
   * Get the last occurrence of a weekday in a month
   */
  private getLastWeekdayOfMonth(
    year: number,
    month: number,
    weekday: number,
  ): Date {
    const date = new Date(year, month + 1, 0); // Last day of month

    while (date.getDay() !== weekday) {
      date.setDate(date.getDate() - 1);
    }

    return date;
  }

  /**
   * Extend a deadline
   */
  async extendDeadline(
    deadlineId: string,
    extensionDays: number,
    reason: string,
    requestedBy: string,
  ): Promise<CaseDeadline> {
    const deadline = await this.deadlineRepository.findOne({
      where: { id: deadlineId },
    });

    if (!deadline) {
      throw new NotFoundException(`Deadline ${deadlineId} not found`);
    }

    // Save original deadline if not already saved
    if (!deadline.originalDeadlineDate) {
      deadline.originalDeadlineDate = deadline.deadlineDate;
    }

    // Calculate new deadline
    const newDeadlineDate = this.calculateDate(
      deadline.deadlineDate,
      extensionDays,
      deadline.businessDaysOnly,
      deadline.excludedDates || [],
    );

    deadline.deadlineDate = newDeadlineDate;
    deadline.status = DeadlineStatus.EXTENDED;
    deadline.extensionRequest = {
      requestedBy,
      requestedDate: new Date(),
      requestedExtensionDays: extensionDays,
      reason,
      status: 'approved',
      reviewedBy: requestedBy,
      reviewedDate: new Date(),
    };

    // Recalculate reminder dates
    deadline.reminderDates = this.calculateReminderDates(newDeadlineDate);

    return this.deadlineRepository.save(deadline);
  }

  /**
   * Get upcoming deadlines for a case
   */
  async getUpcomingDeadlines(
    caseId: string,
    daysAhead: number = 30,
  ): Promise<CaseDeadline[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    return this.deadlineRepository
      .createQueryBuilder('deadline')
      .where('deadline.caseId = :caseId', { caseId })
      .andWhere('deadline.deadlineDate BETWEEN :now AND :futureDate', {
        now,
        futureDate,
      })
      .andWhere('deadline.status != :completed', {
        completed: DeadlineStatus.COMPLETED,
      })
      .orderBy('deadline.deadlineDate', 'ASC')
      .getMany();
  }

  /**
   * Get overdue deadlines
   */
  async getOverdueDeadlines(caseId?: string): Promise<CaseDeadline[]> {
    const queryBuilder = this.deadlineRepository
      .createQueryBuilder('deadline')
      .where('deadline.deadlineDate < :now', { now: new Date() })
      .andWhere('deadline.status NOT IN (:...statuses)', {
        statuses: [DeadlineStatus.COMPLETED, DeadlineStatus.CANCELLED],
      });

    if (caseId) {
      queryBuilder.andWhere('deadline.caseId = :caseId', { caseId });
    }

    return queryBuilder.orderBy('deadline.deadlineDate', 'ASC').getMany();
  }

  /**
   * Mark deadline as completed
   */
  async completeDeadline(
    deadlineId: string,
    completedBy: string,
    notes?: string,
  ): Promise<CaseDeadline> {
    const deadline = await this.deadlineRepository.findOne({
      where: { id: deadlineId },
    });

    if (!deadline) {
      throw new NotFoundException(`Deadline ${deadlineId} not found`);
    }

    deadline.status = DeadlineStatus.COMPLETED;
    deadline.completedDate = new Date();
    deadline.completedBy = completedBy;
    deadline.completionNotes = notes;

    return this.deadlineRepository.save(deadline);
  }

  /**
   * Auto-create deadlines from jurisdiction rules
   */
  async autoCreateDeadlinesFromRules(
    caseId: string,
    jurisdictionId: string,
    triggerEvent: string,
    triggerDate: Date,
  ): Promise<CaseDeadline[]> {
    // Get all active rules for the jurisdiction
    const rules = await this.deadlineRuleRepository.find({
      where: {
        jurisdictionId,
        isActive: true,
      },
    });

    const createdDeadlines: CaseDeadline[] = [];

    for (const rule of rules) {
      try {
        const deadline = await this.createDeadlineFromCalculation(
          {
            caseId,
            jurisdictionId,
            deadlineRuleId: rule.id,
            triggerEvent,
            triggerDate,
          },
          rule.name,
          rule.summary,
          rule.ruleType as DeadlineType,
          this.mapPriorityLevel(rule.priorityLevel),
        );

        createdDeadlines.push(deadline);
      } catch (error) {
        console.error(`Failed to create deadline from rule ${rule.id}:`, error);
      }
    }

    return createdDeadlines;
  }

  /**
   * Map priority level (1-5) to DeadlinePriority enum
   */
  private mapPriorityLevel(level: number): DeadlinePriority {
    if (level === 1) return DeadlinePriority.CRITICAL;
    if (level === 2) return DeadlinePriority.HIGH;
    if (level === 4) return DeadlinePriority.LOW;
    return DeadlinePriority.MEDIUM;
  }
}
