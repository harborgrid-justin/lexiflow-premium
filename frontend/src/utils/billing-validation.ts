/**
 * Billing Validation Utilities
 * Validation rules for time entries, expenses, and invoices
 */

import type { TimeEntry } from "@/types/financial";

/**
 * Time entry validation errors
 */
export interface TimeEntryValidationError {
  field: string;
  message: string;
}

/**
 * Minimum billable increment in hours (0.1 = 6 minutes)
 */
export const MINIMUM_TIME_INCREMENT = 0.1;

/**
 * Maximum hours per day
 */
export const MAXIMUM_HOURS_PER_DAY = 24;

/**
 * Validate time entry data
 */
export function validateTimeEntry(
  entry: Partial<TimeEntry>
): TimeEntryValidationError[] {
  const errors: TimeEntryValidationError[] = [];

  // Required fields
  if (!entry.caseId) {
    errors.push({ field: "caseId", message: "Case is required" });
  }

  if (!entry.userId) {
    errors.push({ field: "userId", message: "User is required" });
  }

  if (!entry.date) {
    errors.push({ field: "date", message: "Date is required" });
  }

  if (!entry.description || entry.description.trim().length === 0) {
    errors.push({ field: "description", message: "Description is required" });
  }

  // Duration validation
  if (entry.duration === undefined || entry.duration === null) {
    errors.push({ field: "duration", message: "Hours is required" });
  } else {
    // Minimum increment check
    if (entry.duration < MINIMUM_TIME_INCREMENT) {
      errors.push({
        field: "duration",
        message: `Minimum billable time is ${MINIMUM_TIME_INCREMENT} hours (6 minutes)`,
      });
    }

    // Round to nearest 0.1 check
    const rounded = Math.round(entry.duration * 10) / 10;
    if (Math.abs(entry.duration - rounded) > 0.001) {
      errors.push({
        field: "duration",
        message: "Time must be in 0.1 hour (6 minute) increments",
      });
    }

    // Maximum hours check
    if (entry.duration > MAXIMUM_HOURS_PER_DAY) {
      errors.push({
        field: "duration",
        message: `Maximum ${MAXIMUM_HOURS_PER_DAY} hours per entry`,
      });
    }
  }

  // Rate validation
  if (entry.rate === undefined || entry.rate === null) {
    errors.push({ field: "rate", message: "Rate is required" });
  } else if (entry.rate < 0) {
    errors.push({ field: "rate", message: "Rate must be positive" });
  }

  // Date validation - cannot be in the future
  if (entry.date) {
    const entryDate = new Date(entry.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today

    if (entryDate > today) {
      errors.push({
        field: "date",
        message: "Date cannot be in the future",
      });
    }
  }

  return errors;
}

/**
 * Check for overlapping time entries
 * Returns true if entries overlap
 */
export function checkTimeEntryOverlap(
  newEntry: {
    userId: string;
    date: string;
    startTime?: string;
    endTime?: string;
  },
  existingEntries: TimeEntry[]
): boolean {
  // If no start/end times specified, we can't check for overlap
  if (!newEntry.startTime || !newEntry.endTime) {
    return false;
  }

  const newStart = new Date(`${newEntry.date}T${newEntry.startTime}`);
  const newEnd = new Date(`${newEntry.date}T${newEntry.endTime}`);

  return existingEntries.some((entry) => {
    // Only check entries for same user and date
    if (entry.userId !== newEntry.userId || entry.date !== newEntry.date) {
      return false;
    }

    // If existing entry doesn't have times, can't overlap
    const entryStartTime = (entry as any).startTime;
    const entryEndTime = (entry as any).endTime;
    if (!entryStartTime || !entryEndTime) {
      return false;
    }

    const existingStart = new Date(`${entry.date}T${entryStartTime}`);
    const existingEnd = new Date(`${entry.date}T${entryEndTime}`);

    // Check if time ranges overlap
    return newStart < existingEnd && newEnd > existingStart;
  });
}

/**
 * Calculate total hours for a user on a given date
 */
export function calculateDailyHours(
  userId: string,
  date: string,
  entries: TimeEntry[]
): number {
  return entries
    .filter((entry) => entry.userId === userId && entry.date === date)
    .reduce((total, entry) => total + entry.duration, 0);
}

/**
 * Validate daily hours don't exceed reasonable limits
 */
export function validateDailyHours(
  userId: string,
  date: string,
  newHours: number,
  existingEntries: TimeEntry[]
): TimeEntryValidationError | null {
  const currentDailyTotal = calculateDailyHours(userId, date, existingEntries);
  const newTotal = currentDailyTotal + newHours;

  if (newTotal > MAXIMUM_HOURS_PER_DAY) {
    return {
      field: "duration",
      message: `Total hours for ${date} would be ${newTotal.toFixed(1)}h (max ${MAXIMUM_HOURS_PER_DAY}h)`,
    };
  }

  return null;
}

/**
 * Round time to nearest billing increment
 */
export function roundToBillingIncrement(hours: number): number {
  return Math.round(hours * 10) / 10;
}

/**
 * Format hours to HH:MM format
 */
export function formatHoursToTime(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Convert HH:MM to decimal hours
 */
export function timeToHours(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) + (minutes || 0) / 60;
}

/**
 * Validate expense amount
 */
export function validateExpenseAmount(
  amount: number
): TimeEntryValidationError | null {
  if (amount <= 0) {
    return {
      field: "amount",
      message: "Amount must be greater than zero",
    };
  }

  if (amount > 1000000) {
    return {
      field: "amount",
      message: "Amount exceeds maximum limit",
    };
  }

  return null;
}

/**
 * Validate invoice totals
 */
export function validateInvoiceTotals(invoice: {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
}): TimeEntryValidationError[] {
  const errors: TimeEntryValidationError[] = [];

  const calculatedTotal =
    invoice.subtotal + invoice.taxAmount - invoice.discountAmount;

  // Allow small floating point differences
  if (Math.abs(calculatedTotal - invoice.totalAmount) > 0.01) {
    errors.push({
      field: "totalAmount",
      message: `Total amount mismatch. Expected ${calculatedTotal.toFixed(2)}, got ${invoice.totalAmount.toFixed(2)}`,
    });
  }

  if (invoice.discountAmount > invoice.subtotal) {
    errors.push({
      field: "discountAmount",
      message: "Discount cannot exceed subtotal",
    });
  }

  return errors;
}
