/**
 * Async Utilities
 *
 * Common async patterns used throughout the application.
 */

import { SYNC_MAX_RETRY_DELAY_MS } from "@/config";
import { API_RETRY_ATTEMPTS, API_RETRY_DELAY_MS } from "@/config/network/api.config";

/**
 * Delay execution for a specified number of milliseconds.
 *
 * @param ms - Number of milliseconds to delay
 * @returns Promise that resolves after the delay
 *
 * @example
 * ```typescript
 * await delay(1000); // Wait 1 second
 * ```
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Yield to the main thread (allows browser to process events).
 * Useful for preventing UI blocking in long-running operations.
 *
 * @example
 * ```typescript
 * for (const item of largeArray) {
 *   await processItem(item);
 *   await yieldToMain(); // Prevent UI blocking
 * }
 * ```
 */
export const yieldToMain = (): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

/**
 * Retry an async operation with exponential backoff.
 *
 * @param fn - Async function to retry
 * @param options - Retry options
 * @returns Promise that resolves with the function result
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   () => fetch('/api/data'),
 *   { maxRetries: 3, initialDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> {
  const {
    maxRetries = API_RETRY_ATTEMPTS,
    initialDelay = API_RETRY_DELAY_MS,
    maxDelay = SYNC_MAX_RETRY_DELAY_MS,
    backoffFactor = 2,
  } = options;

  let lastError: Error;
  let currentDelay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        await delay(Math.min(currentDelay, maxDelay));
        currentDelay *= backoffFactor;
      }
    }
  }

  throw lastError!;
}

/**
 * Debounce an async function.
 *
 * @param fn - Async function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 *
 * @example
 * ```typescript
 * const debouncedSearch = debounce(
 *   async (query: string) => await searchAPI(query),
 *   300
 * );
 * ```
 */
export function debounce<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<ReturnType<T>> | null = null;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise((resolve, reject) => {
        timeoutId = setTimeout(() => {
          timeoutId = null;
          pendingPromise = null;
          fn(...args)
            .then(resolve)
            .catch(reject);
        }, ms);
      });
    }

    return pendingPromise;
  };
}

/**
 * Throttle an async function.
 *
 * @param fn - Async function to throttle
 * @param ms - Throttle interval in milliseconds
 * @returns Throttled function
 *
 * @example
 * ```typescript
 * const throttledSave = throttle(
 *   async (data: Data) => await saveAPI(data),
 *   1000
 * );
 * ```
 */
export function throttle<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ms: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> | void {
  let isThrottled = false;
  let lastResult: Promise<ReturnType<T>> | undefined;

  return (...args: Parameters<T>): Promise<ReturnType<T>> | void => {
    if (isThrottled) {
      return lastResult;
    }

    isThrottled = true;
    lastResult = fn(...args);

    setTimeout(() => {
      isThrottled = false;
    }, ms);

    return lastResult;
  };
}

/**
 * Execute async operations in parallel with a concurrency limit.
 *
 * @param items - Array of items to process
 * @param fn - Async function to apply to each item
 * @param concurrency - Maximum number of concurrent operations
 * @returns Promise that resolves with array of results
 *
 * @example
 * ```typescript
 * const results = await parallelLimit(
 *   fileIds,
 *   (id) => downloadFile(id),
 *   3 // Max 3 concurrent downloads
 * );
 * ```
 */
export async function parallelLimit<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency: number
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, item] of items.entries()) {
    const promise = fn(item).then(result => {
      results[index] = result;
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex(p => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Create an abortable promise with timeout.
 *
 * @param fn - Async function that accepts an AbortSignal
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that rejects if timeout is reached
 *
 * @example
 * ```typescript
 * const data = await withTimeout(
 *   (signal) => fetch('/api/data', { signal }),
 *   5000
 * );
 * ```
 */
export async function withTimeout<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fn(controller.signal);
  } catch (error) {
    if (controller.signal.aborted) {
      throw new Error(`Operation timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
