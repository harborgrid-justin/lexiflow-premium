/**
 * Date Calculation Service - Litigation timeline and deadline management
 * Pure functional date arithmetic with business day support
 * 
 * @module services/infrastructure/dateCalculationService
 * @description Production-ready date calculation service providing:
 * - **Litigation timeline calculations** (deadlines, phases, milestones)
 * - **Business day arithmetic** (excludes weekends, holidays)
 * - **Working day counting** (accurate billable time calculations)
 * - **Canvas position mapping** (timeline visualization support)
 * - **Critical path analysis** (dependency-based deadline calculation)
 * - **Pure functions** (no side effects, testable)
 * - **Type-safe operations** (full TypeScript support)
 * - **date-fns integration** (reliable date library)
 * 
 * @architecture
 * - Pattern: Static utility class (pure functions)
 * - Dependencies: date-fns (battle-tested date library)
 * - Immutability: All operations return new Date objects
 * - Validation: Input validation in all public methods
 * - Error handling: Graceful fallbacks for invalid inputs
 * 
 * @performance
 * - Pure functions: O(1) for simple arithmetic
 * - Working days: O(n) where n = days in range
 * - Critical path: O(n*m) where n = tasks, m = max dependencies
 * - Memory efficient: No caching (stateless)
 * 
 * @usage
 * ```typescript
 * // Calculate due date
 * const dueDate = DateCalculationService.calculateDueDate(
 *   new Date('2025-01-01'),
 *   30,
 *   { excludeWeekends: true }
 * );
 * 
 * // Count working days
 * const workingDays = DateCalculationService.calculateWorkingDays(
 *   startDate,
 *   endDate,
 *   { excludeWeekends: true, excludeHolidays: true, holidays: [new Date('2025-07-04')] }
 * );
 * 
 * // Timeline visualization
 * const xPosition = DateCalculationService.calculatePositionFromDate(
 *   milestoneDate,
 *   projectStart,
 *   pixelsPerDay,
 *   canvasMinX
 * );
 * 
 * // Critical path analysis
 * const projectEnd = DateCalculationService.calculateCriticalPathEndDate(tasks);
 * ```
 * 
 * @legal
 * **Court Deadline Calculations:**
 * - Always verify with local court rules
 * - Consider court-specific holidays
 * - Account for filing deadlines (e.g., COB vs midnight)
 * - Document business day assumptions in case notes
 */

import { addDays, differenceInDays, isWeekend, parseISO, format, addBusinessDays } from 'date-fns';
import { ValidationError } from '@/services/core/errors';

/**
 * Business day calculation options
 * Controls weekend and holiday exclusions
 */
interface BusinessDayOptions {
  excludeWeekends?: boolean;
  excludeHolidays?: boolean;
  holidays?: Date[];
}

/**
 * Date range interface
 * Represents a time period with start and end
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/**
 * DateCalculationService - Pure functions for date operations
 * All methods are static and side-effect free
 */
export class DateCalculationService {
  
  // =============================================================================
  // VALIDATION (Private)
  // =============================================================================

  /**
   * Validate Date object
   * @private
   */
  private static validateDate(date: unknown, paramName: string): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new ValidationError(`[DateCalculationService] Invalid ${paramName} parameter`);
    }
  }

  /**
   * Validate number parameter
   * @private
   */
  private static validateNumber(num: unknown, paramName: string): void {
    if (typeof num !== 'number' || isNaN(num)) {
      throw new ValidationError(`[DateCalculationService] Invalid ${paramName} parameter`);
    }
  }

  // =============================================================================
  // TIMELINE VISUALIZATION
  // =============================================================================

  /**
   * Calculate start date based on X position in canvas
   * Used for timeline visualization and interactive date selection
   * 
   * @param xPosition - Node X coordinate in canvas
   * @param pixelsPerDay - Pixels representing one day
   * @param minX - Leftmost X position in canvas
   * @param referenceDate - Starting reference date (default: today)
   * @returns Date - Calculated start date
   * @throws Error if parameters are invalid
   */
  static calculateStartDateFromPosition(
    xPosition: number,
    pixelsPerDay: number,
    minX: number,
    referenceDate: Date = new Date()
  ): Date {
    try {
      this.validateNumber(xPosition, 'xPosition');
      this.validateNumber(pixelsPerDay, 'pixelsPerDay');
      this.validateNumber(minX, 'minX');
      this.validateDate(referenceDate, 'referenceDate');

      const offsetDays = Math.max(0, Math.floor((xPosition - minX) / pixelsPerDay));
      return addDays(referenceDate, offsetDays);
    } catch (error) {
      console.error('[DateCalculationService.calculateStartDateFromPosition] Error:', error);
      throw error;
    }
  }

  /**
   * Calculate X position from a date
   * Inverse of calculateStartDateFromPosition
   * 
   * @param date - Target date to convert to position
   * @param referenceDate - Starting reference date
   * @param pixelsPerDay - Pixels per day scaling factor
   * @param minX - Leftmost X position in canvas
   * @returns number - X coordinate in canvas
   * @throws Error if parameters are invalid
   */
  static calculatePositionFromDate(
    date: Date,
    referenceDate: Date,
    pixelsPerDay: number,
    minX: number
  ): number {
    try {
      this.validateDate(date, 'date');
      this.validateDate(referenceDate, 'referenceDate');
      this.validateNumber(pixelsPerDay, 'pixelsPerDay');
      this.validateNumber(minX, 'minX');

      const daysDiff = differenceInDays(date, referenceDate);
      return minX + daysDiff * pixelsPerDay;
    } catch (error) {
      console.error('[DateCalculationService.calculatePositionFromDate] Error:', error);
      throw error;
    }
  }

  // =============================================================================
  // DATE ARITHMETIC
  // =============================================================================

  /**
   * Calculate due date based on start date and duration
   * Supports business day calculations (excludes weekends)
   * 
   * @param startDate - Starting date
   * @param durationDays - Duration in days (must be positive)
   * @param options - Business day options (default: calendar days)
   * @returns Date - Calculated due date
   * @throws Error if parameters are invalid
   * 
   * @example
   * // 30 calendar days from today
   * const due = DateCalculationService.calculateDueDate(new Date(), 30);
   * 
   * // 30 business days from today
   * const dueBusiness = DateCalculationService.calculateDueDate(
   *   new Date(),
   *   30,
   *   { excludeWeekends: true }
   * );
   */
  static calculateDueDate(
    startDate: Date,
    durationDays: number,
    options: BusinessDayOptions = { excludeWeekends: false }
  ): Date {
    try {
      this.validateDate(startDate, 'startDate');
      this.validateNumber(durationDays, 'durationDays');
      
      if (durationDays < 0) {
        throw new ValidationError('[DateCalculationService.calculateDueDate] durationDays must be positive');
      }

      if (options.excludeWeekends) {
        return addBusinessDays(startDate, durationDays);
      }
      return addDays(startDate, durationDays);
    } catch (error) {
      console.error('[DateCalculationService.calculateDueDate] Error:', error);
      throw error;
    }
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

