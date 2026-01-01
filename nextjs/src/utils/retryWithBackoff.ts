/**
 * @module utils/retryWithBackoff
 * @description Exponential backoff retry logic for network requests
 */

import {
  API_RETRY_ATTEMPTS,
  API_RETRY_DELAY_MS,
} from "@/config/network/api.config";
import { SYNC_MAX_RETRY_DELAY_MS } from "@/config/network/sync.config";

export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export class RetryError extends Error {
  constructor(
    message: string,
    public readonly attempts: number,
    public readonly lastError: Error
  ) {
    super(message);
    this.name = "RetryError";
  }
}

/**
 * Executes a function with exponential backoff retry logic
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = API_RETRY_ATTEMPTS,
    initialDelay = API_RETRY_DELAY_MS,
    maxDelay = SYNC_MAX_RETRY_DELAY_MS,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      // Call retry callback if provided
      onRetry?.(attempt + 1, lastError);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Exponential backoff with max delay cap
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw new RetryError(
    `Failed after ${maxRetries + 1} attempts`,
    maxRetries + 1,
    lastError!
  );
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  // Network errors
  if (error && typeof error === "object" && "name" in error) {
    const errorName = (error as { name: string }).name;
    if (errorName === "NetworkError" || errorName === "TypeError") {
      return true;
    }
  }

  // HTTP status codes that should be retried
  if (error && typeof error === "object" && "status" in error) {
    const errorStatus = (error as { status: number }).status;
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(errorStatus);
  }

  return false;
}
