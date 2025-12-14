/**
 * @module utils/retryWithBackoff
 * @description Exponential backoff retry logic for network requests
 */

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
    this.name = 'RetryError';
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
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry
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
      await new Promise(resolve => setTimeout(resolve, delay));

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
export function isRetryableError(error: any): boolean {
  // Network errors
  if (error.name === 'NetworkError' || error.name === 'TypeError') {
    return true;
  }

  // HTTP status codes that should be retried
  if (error.status) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  return false;
}
