/**
 * Date Formatting Utility
 * Simple wrapper for date formatting
 */

import { Formatters } from './formatters';

/**
 * Format a date string to a readable format
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(date: string | Date | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return 'N/A';
  return Formatters.date(date, options);
}

/**
 * Format date to short format (MM/DD/YYYY)
 */
export function formatDateShort(date: string | Date | undefined): string {
  return formatDate(date, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/**
 * Format date to long format (Month DD, YYYY)
 */
export function formatDateLong(date: string | Date | undefined): string {
  return formatDate(date, { year: 'numeric', month: 'long', day: 'numeric' });
}

/**
 * Format date with time
 */
export function formatDateTime(date: string | Date | undefined): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
