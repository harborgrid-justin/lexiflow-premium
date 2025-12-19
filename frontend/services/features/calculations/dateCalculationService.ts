/**
 * @module services/features/calculations/dateCalculationService
 * @category Services - Calculations
 * @description Production-ready date calculation service for timeline and Gantt chart operations
 */

class DateCalculationServiceClass {
  /**
   * Calculate start date from a position on a timeline canvas
   * @param position X coordinate on canvas
   * @param pixelsPerDay Scaling factor (pixels per day)
   * @param baseDate Reference date for timeline start
   */
  calculateStartDateFromPosition(
    position: number,
    pixelsPerDay: number,
    baseDate: Date = new Date()
  ): Date {
    const daysFromBase = position / pixelsPerDay;
    const result = new Date(baseDate);
    result.setDate(result.getDate() + Math.floor(daysFromBase));
    return result;
  }

  /**
   * Calculate due date by adding duration to start date
   * @param startDate Starting date
   * @param durationDays Number of days to add
   */
  calculateDueDate(startDate: Date, durationDays: number): Date {
    const result = new Date(startDate);
    result.setDate(result.getDate() + durationDays);
    return result;
  }

  /**
   * Format Date object to ISO string (YYYY-MM-DD)
   * @param date Date to format
   */
  formatToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Parse ISO date string to Date object
   * @param isoString ISO date string (YYYY-MM-DD)
   */
  parseFromISO(isoString: string): Date {
    return new Date(isoString);
  }

  /**
   * Calculate canvas position from date
   * @param date Date to convert to position
   * @param pixelsPerDay Scaling factor
   * @param baseDate Reference date for timeline start
   */
  calculatePositionFromDate(
    date: Date,
    pixelsPerDay: number,
    baseDate: Date = new Date()
  ): number {
    const diffTime = date.getTime() - baseDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays * pixelsPerDay;
  }

  /**
   * Calculate business days between two dates (excluding weekends)
   * @param startDate Start date
   * @param endDate End date
   */
  calculateBusinessDays(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }

  /**
   * Add business days to a date (excluding weekends)
   * @param startDate Starting date
   * @param businessDays Number of business days to add
   */
  addBusinessDays(startDate: Date, businessDays: number): Date {
    const result = new Date(startDate);
    let daysAdded = 0;
    
    while (daysAdded < businessDays) {
      result.setDate(result.getDate() + 1);
      const dayOfWeek = result.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        daysAdded++;
      }
    }
    
    return result;
  }

  /**
   * Check if a date falls on a weekend
   * @param date Date to check
   */
  isWeekend(date: Date): boolean {
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  }

  /**
   * Get the number of days between two dates
   * @param startDate Start date
   * @param endDate End date
   */
  getDaysDifference(startDate: Date, endDate: Date): number {
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const DateCalculationService = new DateCalculationServiceClass();
