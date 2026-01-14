/**
 * @module services/infrastructure/dateCalculationService
 * @description Date calculation utilities
 */

export function calculateDateDifference(
  start: Date | string,
  end: Date | string
): number {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  return Math.floor(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function addDays(date: Date | string, days: number): Date {
  const d = typeof date === "string" ? new Date(date) : new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function formatDate(
  date: Date | string,
  format: "short" | "long" = "short"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format === "short"
    ? d.toLocaleDateString()
    : d.toLocaleDateString("en-US", { dateStyle: "long" });
}

export function formatToISO(date: Date): string {
  return date.toISOString();
}

export function calculateDueDate(startDate: Date, durationDays: number): Date {
  return addDays(startDate, durationDays);
}

export function calculateStartDateFromPosition(
  x: number,
  pixelsPerDay: number,
  minX: number,
  referenceDate: Date
): Date {
  const daysOffset = Math.floor((x - minX) / pixelsPerDay);
  return addDays(referenceDate, daysOffset);
}

export function parseFromISO(isoInfo: string): Date {
  return new Date(isoInfo);
}

export function calculatePositionFromDate(
  date: Date,
  pixelsPerDay: number,
  minX: number,
  referenceDate: Date
): number {
  const diff = calculateDateDifference(referenceDate, date);
  return minX + diff * pixelsPerDay;
}

// Export as object for compatibility
export const DateCalculationService = {
  calculateDateDifference,
  addDays,
  formatDate,
  formatToISO,
  calculateDueDate,
  calculateStartDateFromPosition,
  parseFromISO,
  calculatePositionFromDate,
};
