/**
 * Math utilities for performance optimization
 * Provides cached and optimized mathematical operations
 */

/**
 * Calculate pagination offset
 * Optimized to avoid redundant calculations
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Offset for database query
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate total pages from total count
 * Uses bitwise operations for integer division when possible
 * @param total - Total number of items
 * @param limit - Items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  if (limit === 0) return 0;
  return Math.ceil(total / limit);
}

/**
 * Calculate execution time from start timestamp
 * @param startTime - Start timestamp from Date.now()
 * @returns Execution time in milliseconds
 */
export function calculateExecutionTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Normalize score to a 0-1 range
 * @param score - Raw score value
 * @param min - Minimum possible score
 * @param max - Maximum possible score
 * @returns Normalized score between 0 and 1
 */
export function normalizeScore(
  score: number,
  min: number = 0,
  max: number = 1
): number {
  if (max === min) return 0;
  return Math.max(0, Math.min(1, (score - min) / (max - min)));
}

/**
 * Calculate percentage with precision
 * @param value - Current value
 * @param total - Total value
 * @param decimals - Number of decimal places (default: 1)
 * @returns Percentage value
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals: number = 1
): number {
  if (total === 0) return 0;
  const multiplier = Math.pow(10, decimals);
  return Math.round((value / total) * 100 * multiplier) / multiplier;
}

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Round to specific decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places
 * @returns Rounded value
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate weighted average
 * @param values - Array of values
 * @param weights - Array of weights (must match values length)
 * @returns Weighted average
 */
export function weightedAverage(values: number[], weights: number[]): number {
  if (values.length !== weights.length || values.length === 0) {
    throw new Error("Values and weights must have the same non-zero length");
  }

  let sum = 0;
  let weightSum = 0;

  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    const weight = weights[i];
    if (val === undefined || weight === undefined) {
      throw new Error(`Missing value or weight at index ${i}`);
    }
    sum += val * weight;
    weightSum += weight;
  }

  return weightSum === 0 ? 0 : sum / weightSum;
}

/**
 * Calculate moving average
 * Useful for smoothing time-series data
 * @param values - Array of values
 * @param windowSize - Size of the moving window
 * @returns Array of moving averages
 */
export function movingAverage(values: number[], windowSize: number): number[] {
  if (windowSize <= 0 || windowSize > values.length) {
    return values;
  }

  const result: number[] = [];

  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const end = i + 1;
    const window = values.slice(start, end);
    const avg = window.reduce((sum, val) => sum + val, 0) / window.length;
    result.push(avg);
  }

  return result;
}

/**
 * Calculate standard deviation
 * @param values - Array of values
 * @returns Standard deviation
 */
export function standardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calculate exponential backoff delay
 * Used for retry mechanisms
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds
 * @param maxDelay - Maximum delay cap
 * @returns Delay in milliseconds
 */
export function exponentialBackoff(
  attempt: number,
  baseDelay: number = 1000,
  maxDelay: number = 30000
): number {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Linear interpolation between two values
 * @param start - Start value
 * @param end - End value
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Convert milliseconds to human-readable duration
 * Optimized version that avoids string concatenation
 * @param ms - Milliseconds
 * @returns Object with time units
 */
export function parseDuration(ms: number): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
} {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  return {
    days,
    hours: hours % 24,
    minutes: minutes % 60,
    seconds: seconds % 60,
    milliseconds: ms % 1000,
  };
}

/**
 * Fast integer division (faster than Math.floor for positive numbers)
 * @param dividend - Number to divide
 * @param divisor - Number to divide by
 * @returns Integer result of division
 */
export function fastIntDiv(dividend: number, divisor: number): number {
  return (dividend / divisor) | 0;
}

/**
 * Check if number is within range (inclusive)
 * @param value - Value to check
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if value is in range
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
