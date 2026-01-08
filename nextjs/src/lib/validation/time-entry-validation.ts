/**
 * Time Entry Validation Module
 *
 * Comprehensive validation utilities for time entries matching frontend business rules.
 * Aligned with frontend validation at:
 * frontend/src/services/validation/schemas/time-entry-schema.ts
 *
 * Key Business Rules:
 * - Duration must be positive integers (in minutes)
 * - Maximum daily duration: 1440 minutes (24 hours)
 * - Description minimum length: 10 characters (audit requirement)
 * - Rate validation with constraint checking ($0 - $10,000)
 * - Status enum validation (Draft, Submitted, Approved, Billed, Written Off)
 * - Input sanitization before saving
 * - Billing increment rounding (0.1 hours / 6 minutes)
 *
 * @module lib/validation/time-entry-validation
 */

import { z } from 'zod';
import {
  FINANCIAL_CONSTRAINTS,
  validateHourlyRate,
  roundToBillingIncrement,
  minutesToBillableHours,
} from './financial-constraints';

// =============================================================================
// Constants
// =============================================================================

/**
 * Time entry business rule constraints
 * Aligned with frontend FINANCIAL_CONSTRAINTS
 */
export const TIME_ENTRY_CONSTRAINTS = {
  /** Minimum description length for audit compliance */
  MIN_DESCRIPTION_LENGTH: 10,
  /** Maximum description length */
  MAX_DESCRIPTION_LENGTH: 500,
  /** Maximum daily duration in minutes (24 hours) */
  MAX_DAILY_DURATION: FINANCIAL_CONSTRAINTS.MAX_DAILY_DURATION,
  /** Maximum hourly rate */
  MAX_HOURLY_RATE: FINANCIAL_CONSTRAINTS.MAX_HOURLY_RATE,
  /** Minimum hourly rate (non-zero) */
  MIN_HOURLY_RATE: FINANCIAL_CONSTRAINTS.MIN_HOURLY_RATE,
  /** Billing increment in hours (6 minutes = 0.1 hours) */
  BILLING_INCREMENT_HOURS: FINANCIAL_CONSTRAINTS.BILLING_INCREMENT_HOURS,
  /** Minimum billable duration in hours */
  MIN_BILLABLE_DURATION: FINANCIAL_CONSTRAINTS.MIN_BILLABLE_DURATION,
  /** Maximum category length */
  MAX_CATEGORY_LENGTH: 100,
  /** Maximum internal notes length */
  MAX_INTERNAL_NOTES_LENGTH: 1000,
  /** Maximum activity type length */
  MAX_ACTIVITY_LENGTH: 100,
  /** Maximum LEDES code length */
  MAX_LEDES_CODE_LENGTH: 20,
  /** Maximum task code length */
  MAX_TASK_CODE_LENGTH: 50,
  /** Maximum decimal places for rates */
  MAX_DECIMAL_PLACES: 2,
} as const;

/**
 * Valid time entry status values
 * Matches frontend WIPStatusEnum
 */
export const TIME_ENTRY_STATUSES = [
  'Draft',
  'Submitted',
  'Approved',
  'Billed',
  'Written Off',
  'Rejected',
] as const;

export type TimeEntryStatusType = (typeof TIME_ENTRY_STATUSES)[number];

// =============================================================================
// Type Definitions
// =============================================================================

/**
 * Time entry input interface
 * Matches frontend TimeEntryInput
 */
export interface TimeEntryInput {
  /** Optional ID for existing entries */
  id?: string;
  /** Associated case ID */
  caseId: string;
  /** User ID who recorded the time */
  userId: string;
  /** Date of the time entry (ISO format) */
  date: string;
  /** Duration in minutes */
  duration: number;
  /** Description of work performed (min 10 chars for audit) */
  description: string;
  /** Hourly rate in dollars */
  rate?: number;
  /** Whether the entry is billable */
  billable?: boolean;
  /** Current status */
  status?: string;
  /** Activity category */
  category?: string;
  /** Activity type code */
  activity?: string;
  /** LEDES billing code */
  ledesCode?: string;
  /** Task code */
  taskCode?: string;
  /** Internal notes (not visible to client) */
  internalNotes?: string;
}

/**
 * Time entry validation result
 * Matches frontend TimeEntryValidationResult
 */
export interface TimeEntryValidationResult {
  /** Whether all validations passed */
  valid: boolean;
  /** Array of validation error messages */
  errors: string[];
  /** Sanitized time entry data (only present if valid) */
  sanitized?: TimeEntryInput;
  /** Specific field errors for form display */
  fieldErrors?: Record<string, string[]>;
  /** Warnings that don't block submission */
  warnings?: string[];
}

/**
 * Duration validation result with conversion info
 */
export interface DurationValidationResult {
  /** Whether the duration is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Original value in minutes */
  minutes: number;
  /** Converted value in hours */
  hours: number;
  /** Hours rounded to billing increment */
  roundedHours: number;
}

// =============================================================================
// Core Validation Functions
// =============================================================================

/**
 * Validates a date string
 *
 * @param dateStr - The date string to validate
 * @returns True if the date is valid ISO format
 */
export function isValidDate(dateStr: string): boolean {
  if (!dateStr || typeof dateStr !== 'string') {
    return false;
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Checks if a date is in the future
 *
 * @param dateStr - The date string to check
 * @returns True if the date is after today
 */
export function isFutureDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

/**
 * Validates duration in minutes
 *
 * Business Rules:
 * - Must be a positive integer
 * - Cannot exceed 1440 minutes (24 hours)
 *
 * @param minutes - Duration in minutes
 * @returns Whether the duration is valid
 */
export function isValidDuration(minutes: number): boolean {
  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return false;
  }
  // Must be a positive integer
  if (!Number.isInteger(minutes) || minutes <= 0) {
    return false;
  }
  // Cannot exceed 24 hours
  if (minutes > TIME_ENTRY_CONSTRAINTS.MAX_DAILY_DURATION) {
    return false;
  }
  return true;
}

/**
 * Validates duration with detailed result
 *
 * @param minutes - Duration in minutes
 * @returns Detailed validation result with conversion info
 *
 * @example
 * ```ts
 * const result = validateDuration(90);
 * // { valid: true, minutes: 90, hours: 1.5, roundedHours: 1.5 }
 *
 * const invalid = validateDuration(1500);
 * // { valid: false, error: "Duration cannot exceed 1440 minutes (24 hours)", ... }
 * ```
 */
export function validateDuration(minutes: number): DurationValidationResult {
  const hours = typeof minutes === 'number' && !isNaN(minutes) ? minutes / 60 : 0;
  const roundedHours = roundToBillingIncrement(hours);

  if (typeof minutes !== 'number' || isNaN(minutes)) {
    return {
      valid: false,
      error: 'Duration must be a valid number',
      minutes: 0,
      hours: 0,
      roundedHours: 0,
    };
  }

  if (minutes < 0) {
    return {
      valid: false,
      error: 'Duration cannot be negative',
      minutes,
      hours,
      roundedHours,
    };
  }

  if (minutes === 0) {
    return {
      valid: false,
      error: 'Duration must be greater than zero',
      minutes,
      hours: 0,
      roundedHours: 0,
    };
  }

  if (!Number.isInteger(minutes)) {
    return {
      valid: false,
      error: 'Duration must be a positive integer (minutes)',
      minutes,
      hours,
      roundedHours,
    };
  }

  if (minutes > TIME_ENTRY_CONSTRAINTS.MAX_DAILY_DURATION) {
    return {
      valid: false,
      error: `Duration cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_DAILY_DURATION} minutes (24 hours)`,
      minutes,
      hours,
      roundedHours,
    };
  }

  return {
    valid: true,
    minutes,
    hours,
    roundedHours,
  };
}

/**
 * Validates string length is within bounds
 *
 * @param str - String to validate
 * @param min - Minimum length
 * @param max - Maximum length
 * @returns Whether string length is valid
 */
export function isValidStringLength(str: string, min: number, max: number): boolean {
  if (!str || typeof str !== 'string') {
    return min === 0;
  }
  const length = str.trim().length;
  return length >= min && length <= max;
}

/**
 * Validates rate is within acceptable limits
 *
 * Business Rules:
 * - Must be a non-negative number
 * - If non-zero, must be >= $0.01
 * - Cannot exceed $10,000
 * - Maximum 2 decimal places
 *
 * @param rate - Hourly rate in dollars
 * @returns Whether the rate is valid
 */
export function isValidRate(rate: number): boolean {
  if (typeof rate !== 'number' || isNaN(rate)) {
    return false;
  }
  if (rate < 0) {
    return false;
  }
  // If non-zero, must meet minimum
  if (rate > 0 && rate < TIME_ENTRY_CONSTRAINTS.MIN_HOURLY_RATE) {
    return false;
  }
  // Cannot exceed maximum
  if (rate > TIME_ENTRY_CONSTRAINTS.MAX_HOURLY_RATE) {
    return false;
  }
  // Check decimal places
  const decimalPlaces = (rate.toString().split('.')[1] || '').length;
  if (decimalPlaces > TIME_ENTRY_CONSTRAINTS.MAX_DECIMAL_PLACES) {
    return false;
  }
  return true;
}

/**
 * Validates a value against an enum
 *
 * @param value - Value to check
 * @param validValues - Array of valid values
 * @returns Whether the value is in the enum
 */
export function isValidEnum<T>(value: unknown, validValues: readonly T[]): value is T {
  return validValues.includes(value as T);
}

// =============================================================================
// Input Sanitization Functions
// =============================================================================

/**
 * Sanitizes a string input by trimming and removing potentially harmful content
 *
 * @param input - String to sanitize
 * @returns Sanitized string
 *
 * @example
 * ```ts
 * sanitizeString('  Hello <script>alert("xss")</script> World  ');
 * // 'Hello  World'
 * ```
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove any remaining angle brackets
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Sanitizes time entry input before saving
 *
 * Performs the following sanitization:
 * - Trims all string fields
 * - Removes HTML tags from description and notes
 * - Normalizes whitespace
 * - Ensures numeric fields are proper numbers
 *
 * @param entry - Time entry input to sanitize
 * @returns Sanitized time entry input
 *
 * @example
 * ```ts
 * const sanitized = sanitizeTimeEntryInput({
 *   caseId: 'case-123',
 *   userId: 'user-456',
 *   date: '2024-01-15',
 *   duration: 60,
 *   description: '  Drafted <b>motion</b> for summary judgment  ',
 *   rate: 350.00,
 *   category: ' Research '
 * });
 * // description becomes: 'Drafted motion for summary judgment'
 * // category becomes: 'Research'
 * ```
 */
export function sanitizeTimeEntryInput(entry: TimeEntryInput): TimeEntryInput {
  return {
    ...entry,
    id: entry.id?.trim(),
    caseId: entry.caseId?.trim() || '',
    userId: entry.userId?.trim() || '',
    date: entry.date?.trim() || '',
    duration: typeof entry.duration === 'number' ? Math.round(entry.duration) : 0,
    description: sanitizeString(entry.description || ''),
    rate: typeof entry.rate === 'number' ? entry.rate : undefined,
    billable: typeof entry.billable === 'boolean' ? entry.billable : true,
    status: entry.status?.trim(),
    category: entry.category ? sanitizeString(entry.category) : undefined,
    activity: entry.activity?.trim(),
    ledesCode: entry.ledesCode?.trim(),
    taskCode: entry.taskCode?.trim(),
    internalNotes: entry.internalNotes ? sanitizeString(entry.internalNotes) : undefined,
  };
}

// =============================================================================
// Main Validation Function
// =============================================================================

/**
 * Validates time entry with comprehensive business rule checks
 *
 * Performs the following validations:
 * - Required field presence (caseId, userId, date, duration, description)
 * - Date validity and not in future
 * - Duration as positive integer, max 24 hours
 * - Description minimum 10 characters (audit requirement)
 * - Rate validation with constraint checking
 * - Status enum validation
 * - Input sanitization
 *
 * @param entry - Time entry input to validate
 * @returns Validation result with errors and sanitized data
 *
 * @example
 * ```ts
 * const result = validateTimeEntry({
 *   caseId: 'case-123',
 *   userId: 'user-456',
 *   date: '2024-01-15',
 *   duration: 60,
 *   description: 'Drafted motion for summary judgment',
 *   rate: 350
 * });
 *
 * if (result.valid) {
 *   await saveTimeEntry(result.sanitized);
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
export function validateTimeEntry(entry: TimeEntryInput): TimeEntryValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string[]> = {};
  const warnings: string[] = [];

  const addError = (field: string, message: string): void => {
    errors.push(message);
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(message);
  };

  const addWarning = (message: string): void => {
    warnings.push(message);
  };

  try {
    // ==========================================================================
    // Required Fields Validation
    // ==========================================================================

    // Case ID validation
    if (!entry.caseId || typeof entry.caseId !== 'string' || entry.caseId.trim().length === 0) {
      addError('caseId', 'Valid case ID is required');
    }

    // User ID validation
    if (!entry.userId || typeof entry.userId !== 'string' || entry.userId.trim().length === 0) {
      addError('userId', 'Valid user ID is required');
    }

    // ==========================================================================
    // Date Validation
    // ==========================================================================

    if (!entry.date || !isValidDate(entry.date)) {
      addError('date', 'Valid ISO date is required');
    } else if (isFutureDate(entry.date)) {
      addError('date', 'Time entry date cannot be in the future');
    }

    // ==========================================================================
    // Duration Validation (Business Rule: positive integer, max 24 hours)
    // ==========================================================================

    const durationResult = validateDuration(entry.duration);
    if (!durationResult.valid) {
      addError('duration', durationResult.error || 'Duration must be a positive integer (minutes)');
    }

    // ==========================================================================
    // Description Validation (Audit Requirement: min 10 characters)
    // ==========================================================================

    if (!entry.description) {
      addError('description', 'Description is required');
    } else {
      const descLength = entry.description.trim().length;
      if (descLength < TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH) {
        addError(
          'description',
          `Description must be at least ${TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH} characters (audit requirement)`
        );
      } else if (descLength > TIME_ENTRY_CONSTRAINTS.MAX_DESCRIPTION_LENGTH) {
        addError(
          'description',
          `Description cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }

    // ==========================================================================
    // Rate Validation (Optional but validated if present)
    // ==========================================================================

    if (entry.rate !== undefined && entry.rate !== null) {
      const rateValidation = validateHourlyRate(entry.rate);
      if (!rateValidation.valid) {
        addError(
          'rate',
          rateValidation.error ||
            `Rate must be between $0 and $${TIME_ENTRY_CONSTRAINTS.MAX_HOURLY_RATE.toLocaleString()} with max 2 decimal places`
        );
      }
    }

    // ==========================================================================
    // Status Validation (Optional but validated if present)
    // ==========================================================================

    if (entry.status && !isValidEnum(entry.status, TIME_ENTRY_STATUSES)) {
      addError('status', `Invalid status. Must be one of: ${TIME_ENTRY_STATUSES.join(', ')}`);
    }

    // ==========================================================================
    // Optional Field Length Validation
    // ==========================================================================

    if (
      entry.category &&
      entry.category.length > TIME_ENTRY_CONSTRAINTS.MAX_CATEGORY_LENGTH
    ) {
      addError(
        'category',
        `Category cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_CATEGORY_LENGTH} characters`
      );
    }

    if (
      entry.activity &&
      entry.activity.length > TIME_ENTRY_CONSTRAINTS.MAX_ACTIVITY_LENGTH
    ) {
      addError(
        'activity',
        `Activity cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_ACTIVITY_LENGTH} characters`
      );
    }

    if (
      entry.ledesCode &&
      entry.ledesCode.length > TIME_ENTRY_CONSTRAINTS.MAX_LEDES_CODE_LENGTH
    ) {
      addError(
        'ledesCode',
        `LEDES code cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_LEDES_CODE_LENGTH} characters`
      );
    }

    if (
      entry.taskCode &&
      entry.taskCode.length > TIME_ENTRY_CONSTRAINTS.MAX_TASK_CODE_LENGTH
    ) {
      addError(
        'taskCode',
        `Task code cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_TASK_CODE_LENGTH} characters`
      );
    }

    if (
      entry.internalNotes &&
      entry.internalNotes.length > TIME_ENTRY_CONSTRAINTS.MAX_INTERNAL_NOTES_LENGTH
    ) {
      addError(
        'internalNotes',
        `Internal notes cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_INTERNAL_NOTES_LENGTH} characters`
      );
    }

    // ==========================================================================
    // Warnings (non-blocking)
    // ==========================================================================

    // Warn if duration is very short (less than 6 minutes but > 0)
    if (
      durationResult.valid &&
      entry.duration < 6 &&
      entry.duration > 0
    ) {
      addWarning(
        `Duration of ${entry.duration} minute(s) will be rounded up to 6 minutes (0.1 hours) for billing`
      );
    }

    // Warn if rate is zero on billable entry
    if (entry.billable !== false && (entry.rate === undefined || entry.rate === 0)) {
      addWarning('Billable time entry has no rate set');
    }

    // ==========================================================================
    // Return Result
    // ==========================================================================

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        fieldErrors,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    }

    // Sanitize inputs for safe storage
    const sanitized = sanitizeTimeEntryInput(entry);

    return {
      valid: true,
      errors: [],
      sanitized,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      ],
      fieldErrors: { _form: ['An unexpected validation error occurred'] },
    };
  }
}

// =============================================================================
// Billing Increment Functions
// =============================================================================

/**
 * Re-export roundToBillingIncrement for convenience
 *
 * Rounds hours to the nearest billing increment (0.1 hours / 6 minutes).
 * This is the standard billing increment for legal time tracking.
 *
 * @param hours - The hours to round
 * @returns Hours rounded to nearest 0.1 (6-minute) increment
 *
 * @example
 * ```ts
 * roundToBillingIncrement(1.23); // 1.2
 * roundToBillingIncrement(1.25); // 1.3
 * roundToBillingIncrement(0.08); // 0.1 (minimum)
 * roundToBillingIncrement(2.54); // 2.5
 * ```
 */
export { roundToBillingIncrement } from './financial-constraints';

/**
 * Converts minutes to hours and rounds to billing increment
 *
 * @param minutes - Duration in minutes
 * @returns Hours rounded to 0.1 hour increments
 *
 * @example
 * ```ts
 * minutesToRoundedHours(90);  // 1.5
 * minutesToRoundedHours(65);  // 1.1
 * minutesToRoundedHours(5);   // 0.1 (minimum)
 * ```
 */
export function minutesToRoundedHours(minutes: number): number {
  return minutesToBillableHours(minutes);
}

/**
 * Calculates the billable amount for a time entry
 *
 * @param durationMinutes - Duration in minutes
 * @param hourlyRate - Hourly rate in dollars
 * @returns Billable amount after rounding to billing increments
 *
 * @example
 * ```ts
 * calculateBillableAmount(90, 350);  // 525.00 (1.5 hours * $350)
 * calculateBillableAmount(5, 350);   // 35.00 (0.1 hours * $350 - minimum)
 * ```
 */
export function calculateBillableAmount(
  durationMinutes: number,
  hourlyRate: number
): number {
  const roundedHours = minutesToRoundedHours(durationMinutes);
  const amount = roundedHours * hourlyRate;
  // Round to 2 decimal places
  return Math.round(amount * 100) / 100;
}

// =============================================================================
// Zod Schema for Server-Side Validation
// =============================================================================

/**
 * Zod schema for time entry status validation
 */
export const timeEntryStatusSchema = z.enum(TIME_ENTRY_STATUSES);

/**
 * Zod schema for comprehensive time entry validation
 *
 * Provides type-safe validation that can be used with React Hook Form
 * or direct server-side validation.
 */
export const timeEntrySchema = z
  .object({
    id: z.string().uuid().optional(),
    caseId: z.string().min(1, 'Case ID is required'),
    userId: z.string().min(1, 'User ID is required'),
    date: z
      .string()
      .min(1, 'Date is required')
      .refine((val) => !isNaN(Date.parse(val)), { message: 'Invalid date format' })
      .refine((val) => !isFutureDate(val), {
        message: 'Time entry date cannot be in the future',
      }),
    duration: z
      .number({ message: 'Duration is required and must be a number' })
      .int('Duration must be a positive integer (minutes)')
      .positive('Duration must be greater than zero')
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_DAILY_DURATION,
        `Duration cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_DAILY_DURATION} minutes (24 hours)`
      ),
    description: z
      .string()
      .min(
        TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH,
        `Description must be at least ${TIME_ENTRY_CONSTRAINTS.MIN_DESCRIPTION_LENGTH} characters (audit requirement)`
      )
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_DESCRIPTION_LENGTH,
        `Description cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_DESCRIPTION_LENGTH} characters`
      ),
    rate: z
      .number()
      .nonnegative('Rate cannot be negative')
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_HOURLY_RATE,
        `Rate cannot exceed $${TIME_ENTRY_CONSTRAINTS.MAX_HOURLY_RATE.toLocaleString()}`
      )
      .refine(
        (val) => val === 0 || val >= TIME_ENTRY_CONSTRAINTS.MIN_HOURLY_RATE,
        {
          message: `Rate must be at least $${TIME_ENTRY_CONSTRAINTS.MIN_HOURLY_RATE} if not zero`,
        }
      )
      .optional(),
    billable: z.boolean().default(true),
    status: timeEntryStatusSchema.optional(),
    category: z
      .string()
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_CATEGORY_LENGTH,
        `Category cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_CATEGORY_LENGTH} characters`
      )
      .optional(),
    activity: z
      .string()
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_ACTIVITY_LENGTH,
        `Activity cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_ACTIVITY_LENGTH} characters`
      )
      .optional(),
    ledesCode: z
      .string()
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_LEDES_CODE_LENGTH,
        `LEDES code cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_LEDES_CODE_LENGTH} characters`
      )
      .optional(),
    taskCode: z
      .string()
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_TASK_CODE_LENGTH,
        `Task code cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_TASK_CODE_LENGTH} characters`
      )
      .optional(),
    internalNotes: z
      .string()
      .max(
        TIME_ENTRY_CONSTRAINTS.MAX_INTERNAL_NOTES_LENGTH,
        `Internal notes cannot exceed ${TIME_ENTRY_CONSTRAINTS.MAX_INTERNAL_NOTES_LENGTH} characters`
      )
      .optional(),
  })
  .transform((data) => ({
    ...data,
    description: sanitizeString(data.description),
    category: data.category ? sanitizeString(data.category) : undefined,
    internalNotes: data.internalNotes ? sanitizeString(data.internalNotes) : undefined,
  }));

/**
 * Type inferred from the Zod schema
 */
export type TimeEntrySchemaInput = z.input<typeof timeEntrySchema>;
export type TimeEntrySchemaOutput = z.output<typeof timeEntrySchema>;

/**
 * Validate time entry using Zod schema
 *
 * @param data - The time entry data to validate
 * @returns Zod safe parse result with success/error status and parsed data
 */
export function validateTimeEntrySchema(data: unknown) {
  return timeEntrySchema.safeParse(data);
}

// =============================================================================
// Batch Validation Functions
// =============================================================================

/**
 * Validates multiple time entries at once
 *
 * @param entries - Array of time entry inputs to validate
 * @returns Array of validation results corresponding to each entry
 *
 * @example
 * ```ts
 * const results = validateTimeEntries([entry1, entry2, entry3]);
 * const allValid = results.every(r => r.valid);
 * ```
 */
export function validateTimeEntries(
  entries: TimeEntryInput[]
): TimeEntryValidationResult[] {
  return entries.map(validateTimeEntry);
}

/**
 * Result of batch validation
 */
export interface BatchTimeEntryValidationResult {
  /** Whether all entries are valid */
  allValid: boolean;
  /** Total number of entries */
  total: number;
  /** Number of valid entries */
  validCount: number;
  /** Number of invalid entries */
  invalidCount: number;
  /** Individual results for each entry */
  results: Array<TimeEntryValidationResult & { index: number }>;
  /** Aggregated errors across all entries */
  errors: string[];
}

/**
 * Validates multiple time entries and returns aggregated result
 *
 * @param entries - Array of time entry inputs to validate
 * @returns Aggregated validation result
 *
 * @example
 * ```ts
 * const result = validateTimeEntriesBatch([entry1, entry2, entry3]);
 * if (!result.allValid) {
 *   console.log(`${result.invalidCount} of ${result.total} entries have errors`);
 *   console.log(result.errors);
 * }
 * ```
 */
export function validateTimeEntriesBatch(
  entries: TimeEntryInput[]
): BatchTimeEntryValidationResult {
  const results = entries.map((entry, index) => ({
    ...validateTimeEntry(entry),
    index,
  }));

  const validCount = results.filter((r) => r.valid).length;
  const invalidCount = results.filter((r) => !r.valid).length;

  const errors: string[] = [];
  results.forEach((result) => {
    if (!result.valid) {
      result.errors.forEach((error) => {
        errors.push(`Entry ${result.index + 1}: ${error}`);
      });
    }
  });

  return {
    allValid: invalidCount === 0,
    total: entries.length,
    validCount,
    invalidCount,
    results,
    errors,
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Formats duration in minutes to display string
 *
 * @param minutes - Duration in minutes
 * @returns Formatted string (e.g., "1h 30m" or "45m")
 *
 * @example
 * ```ts
 * formatDuration(90);  // "1h 30m"
 * formatDuration(45);  // "45m"
 * formatDuration(120); // "2h 0m"
 * ```
 */
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) {
    return '0m';
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  return `${hours}h ${mins}m`;
}

/**
 * Formats duration as decimal hours for billing display
 *
 * @param minutes - Duration in minutes
 * @returns Formatted decimal hours string
 *
 * @example
 * ```ts
 * formatBillableHours(90);  // "1.5 hrs"
 * formatBillableHours(45);  // "0.8 hrs"
 * formatBillableHours(6);   // "0.1 hrs"
 * ```
 */
export function formatBillableHours(minutes: number): string {
  const hours = minutesToRoundedHours(minutes);
  return `${hours.toFixed(1)} hrs`;
}

/**
 * Gets a human-readable summary of validation errors
 *
 * @param result - Validation result
 * @returns Human-readable error summary or null if valid
 */
export function getValidationSummary(
  result: TimeEntryValidationResult
): string | null {
  if (result.valid) {
    return null;
  }

  if (result.errors.length === 1) {
    return result.errors[0];
  }

  return `${result.errors.length} validation errors: ${result.errors.join('; ')}`;
}
