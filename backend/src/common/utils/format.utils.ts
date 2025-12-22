/**
 * Formatting Utility Functions
 * Reusable formatting and display helpers
 */

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Parse human-readable size string to bytes
 * @param sizeString - Size string (e.g., "1.5 MB", "500KB")
 * @returns Number of bytes
 */
export function parseSize(sizeString: string): number {
  const units: { [key: string]: number } = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };

  const match = sizeString.trim().match(/^([\d.]+)\s*([A-Z]+)$/i);
  if (!match) {
    throw new Error(`Invalid size format: ${sizeString}`);
  }

  const value = parseFloat(match[1] || '0');
  const unit = (match[2] || '').toUpperCase();

  if (!(unit in units)) {
    throw new Error(`Unknown unit: ${unit}`);
  }

  return Math.floor(value * units[unit]);
}

/**
 * Format duration in milliseconds to human-readable string
 * @param ms - Duration in milliseconds
 * @returns Formatted string (e.g., "2h 30m", "45s")
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }

  if (minutes > 0) {
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }

  return `${seconds}s`;
}

/**
 * Format number with thousands separator
 * @param num - Number to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted string
 */
export function formatNumber(num: number, locale: string = 'en-US'): string {
  return num.toLocaleString(locale);
}

/**
 * Format percentage
 * @param value - Value to format
 * @param total - Total value for percentage calculation
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number, total: number, decimals: number = 1): string {
  if (total === 0) return '0%';
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number, ellipsis: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Format file path for display (truncate middle if too long)
 * @param filePath - File path to format
 * @param maxLength - Maximum length
 * @returns Formatted path
 */
export function formatPath(filePath: string, maxLength: number = 50): string {
  if (filePath.length <= maxLength) return filePath;

  const parts = filePath.split('/');
  if (parts.length <= 2) return truncate(filePath, maxLength);

  const fileName = parts[parts.length - 1] || '';
  const firstPart = parts[0] || '';
  const remainingLength = maxLength - fileName.length - firstPart.length - 6; // 6 for '/...//'

  if (remainingLength < 0) {
    return `${firstPart}/.../${truncate(fileName, maxLength - firstPart.length - 5)}`;
  }

  return `${firstPart}/.../${fileName}`;
}
