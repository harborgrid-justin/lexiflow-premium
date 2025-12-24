/**
 * dateUtils.ts
 * 
 * Date formatting and manipulation utilities
 * Replaces 40+ instances of date string operations
 */

// ============================================================================
// DATE STRING OPERATIONS
// ============================================================================

/**
 * Get current date in YYYY-MM-DD format
 * Replaces: new Date().toISOString().split('T')[0]
 */
export const getTodayString = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Format date object to YYYY-MM-DD string
 */
export const toDateString = (date: Date | string): string => {
  if (typeof date === 'string') return date.split('T')[0];
  return date.toISOString().split('T')[0];
};

/**
 * Format date for display (e.g., "Dec 19, 2025")
 */
export const formatDateDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Format date with time (e.g., "Dec 19, 2025 3:45 PM")
 */
export const formatDateTimeDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
export const getRelativeTimeString = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMinutes) < 1) return 'just now';
  if (Math.abs(diffMinutes) < 60) {
    return diffMinutes < 0 
      ? `${Math.abs(diffMinutes)} minutes ago` 
      : `in ${diffMinutes} minutes`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours < 0
      ? `${Math.abs(diffHours)} hours ago`
      : `in ${diffHours} hours`;
  }
  return diffDays < 0
    ? `${Math.abs(diffDays)} days ago`
    : `in ${diffDays} days`;
};

// ============================================================================
// DATE CALCULATIONS
// ============================================================================

/**
 * Add days to a date
 */
export const addDays = (date: Date | string, days: number): string => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return toDateString(d);
};

/**
 * Check if date is in the past
 */
export const isPast = (dateString: string): boolean => {
  return new Date(dateString) < new Date();
};

/**
 * Check if date is in the future
 */
export const isFuture = (dateString: string): boolean => {
  return new Date(dateString) > new Date();
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
  return toDateString(new Date(dateString)) === getTodayString();
};

/**
 * Get days until/since a date
 */
export const getDaysUntil = (dateString: string): number => {
  const date = new Date(dateString);
  const today = new Date(getTodayString());
  const diffMs = date.getTime() - today.getTime();
  return Math.ceil(diffMs / 86400000);
};

// ============================================================================
// DATE RANGE OPERATIONS
// ============================================================================

/**
 * Generate filename with current date
 * Example: "cases-export-2025-12-19.csv"
 */
export const generateDateFilename = (prefix: string, extension: string): string => {
  return `${prefix}-${getTodayString()}.${extension}`;
};

/**
 * Check if date is within range
 */
export const isDateInRange = (
  dateString: string,
  startDate: string,
  endDate: string
): boolean => {
  const date = new Date(dateString);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return date >= start && date <= end;
};
