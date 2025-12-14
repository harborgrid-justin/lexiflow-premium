/**
 * dateCalculationService.ts
 * 
 * Centralized date calculation service for litigation timeline management.
 * Provides pure functions for date arithmetic, working days, and duration calculations.
 * 
 * @module services/dateCalculationService
 */

import { addDays, differenceInDays, isWeekend, parseISO, format, addBusinessDays } from 'date-fns';

/**
 * Business day calculation options
 */
interface BusinessDayOptions {
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
  holidays?: Date[];
}

/**
 * Date range interface
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * DateCalculationService - Pure functions for date operations
 */
export class DateCalculationService {
  /**
   * Calculate start date based on X position in canvas
   * @param xPosition Node X coordinate
   * @param pixelsPerDay Pixels representing one day
   * @param minX Leftmost X position in canvas
   * @param referenceDate Starting reference date
   */
  static calculateStartDateFromPosition(
    xPosition: number,
    pixelsPerDay: number,
    minX: number,
    referenceDate: Date = new Date()
  ): Date {
    const offsetDays = Math.max(0, Math.floor((xPosition - minX) / pixelsPerDay));
    return addDays(referenceDate, offsetDays);
  }

  /**
   * Calculate X position from a date
   * @param date Target date
   * @param referenceDate Starting reference date
   * @param pixelsPerDay Pixels per day
   * @param minX Leftmost X position
   */
  static calculatePositionFromDate(
    date: Date,
    referenceDate: Date,
    pixelsPerDay: number,
    minX: number
  ): number {
    const daysDiff = differenceInDays(date, referenceDate);
    return minX + daysDiff * pixelsPerDay;
  }

  /**
   * Calculate due date based on start date and duration
   * @param startDate Starting date
   * @param durationDays Duration in days
   * @param options Business day options
   */
  static calculateDueDate(
    startDate: Date,
    durationDays: number,
    options: BusinessDayOptions = { excludeWeekends: false }
  ): Date {
    if (options.excludeWeekends) {
      return addBusinessDays(startDate, durationDays);
    }
    return addDays(startDate, durationDays);
  }

  /**
   * Calculate working days between two dates
   * @param startDate Start date
   * @param endDate End date
   * @param options Business day options
   */
  static calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    options: BusinessDayOptions = { excludeWeekends: true, excludeHolidays: false }
  ): number {
    let workingDays = 0;
    let currentDate = new Date(startDate);
    const holidays = new Set(options.holidays?.map(h => format(h, 'yyyy-MM-dd')) || []);

    while (currentDate <= endDate) {
      const isHoliday = holidays.has(format(currentDate, 'yyyy-MM-dd'));
      const isWeekendDay = isWeekend(currentDate);

      if (!isHoliday && !(options.excludeWeekends && isWeekendDay)) {
        workingDays++;
      }

      currentDate = addDays(currentDate, 1);
    }

    return workingDays;
  }

  /**
   * Calculate duration in days between two dates
   * @param startDate Start date
   * @param endDate End date
   */
  static calculateDuration(startDate: Date | string, endDate: Date | string): number {
    const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
    const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
    return Math.max(0, differenceInDays(end, start));
  }

  /**
   * Format date to ISO string (YYYY-MM-DD)
   * @param date Date to format
   */
  static formatToISO(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  /**
   * Parse ISO date string to Date object
   * @param dateString ISO date string
   */
  static parseFromISO(dateString: string): Date {
    return parseISO(dateString);
  }

  /**
   * Get business days array between two dates
   * @param startDate Start date
   * @param endDate End date
   * @param options Business day options
   */
  static getBusinessDaysArray(
    startDate: Date,
    endDate: Date,
    options: BusinessDayOptions = { excludeWeekends: true }
  ): Date[] {
    const businessDays: Date[] = [];
    let currentDate = new Date(startDate);
    const holidays = new Set(options.holidays?.map(h => format(h, 'yyyy-MM-dd')) || []);

    while (currentDate <= endDate) {
      const isHoliday = holidays.has(format(currentDate, 'yyyy-MM-dd'));
      const isWeekendDay = isWeekend(currentDate);

      if (!isHoliday && !(options.excludeWeekends && isWeekendDay)) {
        businessDays.push(new Date(currentDate));
      }

      currentDate = addDays(currentDate, 1);
    }

    return businessDays;
  }

  /**
   * Calculate phase duration from child tasks
   * @param tasks Array of task date ranges
   */
  static calculatePhaseDuration(tasks: DateRange[]): DateRange | null {
    if (tasks.length === 0) return null;

    const startDates = tasks.map(t => t.start);
    const endDates = tasks.map(t => t.end);

    return {
      start: new Date(Math.min(...startDates.map(d => d.getTime()))),
      end: new Date(Math.max(...endDates.map(d => d.getTime()))),
    };
  }

  /**
   * Add buffer days to a date
   * @param date Original date
   * @param bufferDays Number of buffer days to add
   * @param options Business day options
   */
  static addBufferDays(
    date: Date,
    bufferDays: number,
    options: BusinessDayOptions = { excludeWeekends: false }
  ): Date {
    return this.calculateDueDate(date, bufferDays, options);
  }

  /**
   * Check if date falls on weekend
   * @param date Date to check
   */
  static isWeekend(date: Date): boolean {
    return isWeekend(date);
  }

  /**
   * Check if date falls on a holiday
   * @param date Date to check
   * @param holidays Array of holiday dates
   */
  static isHoliday(date: Date, holidays: Date[]): boolean {
    const dateStr = format(date, 'yyyy-MM-dd');
    return holidays.some(h => format(h, 'yyyy-MM-dd') === dateStr);
  }

  /**
   * Get the next business day from a given date
   * @param date Starting date
   * @param options Business day options
   */
  static getNextBusinessDay(date: Date, options: BusinessDayOptions = {}): Date {
    let nextDay = addDays(date, 1);
    const holidays = new Set(options.holidays?.map(h => format(h, 'yyyy-MM-dd')) || []);

    while (
      (options.excludeWeekends && isWeekend(nextDay)) ||
      (options.excludeHolidays && holidays.has(format(nextDay, 'yyyy-MM-dd')))
    ) {
      nextDay = addDays(nextDay, 1);
    }

    return nextDay;
  }

  /**
   * Calculate critical path end date
   * @param tasks Array of tasks with dependencies
   */
  static calculateCriticalPathEndDate(
    tasks: Array<{ id: string; startDate: Date; durationDays: number; dependencies: string[] }>
  ): Date {
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const endDates = new Map<string, Date>();

    const calculateEndDate = (taskId: string): Date => {
      if (endDates.has(taskId)) {
        return endDates.get(taskId)!;
      }

      const task = taskMap.get(taskId);
      if (!task) return new Date();

      let latestDependencyEnd = task.startDate;

      for (const depId of task.dependencies) {
        const depEnd = calculateEndDate(depId);
        if (depEnd > latestDependencyEnd) {
          latestDependencyEnd = depEnd;
        }
      }

      const taskEnd = addDays(latestDependencyEnd, task.durationDays);
      endDates.set(taskId, taskEnd);
      return taskEnd;
    };

    let criticalEnd = new Date(0);
    for (const task of tasks) {
      const end = calculateEndDate(task.id);
      if (end > criticalEnd) {
        criticalEnd = end;
      }
    }

    return criticalEnd;
  }
}
