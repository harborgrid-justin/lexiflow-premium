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
