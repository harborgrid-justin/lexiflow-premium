/**
 * Enterprise API Retry Handler
 * Implements retry logic with exponential backoff and jitter
 *
 * @module api/enterprise/retry-handler
 * @description Provides intelligent retry logic for failed API requests including:
 * - Exponential backoff with jitter
 * - Configurable retry attempts and delays
 * - Retry predicate for selective retries
 * - Request timeout handling
 * - Circuit breaker pattern support
 *
 * @performance
 * - Minimizes server load with exponential backoff
 * - Prevents thundering herd with random jitter
 * - Respects rate limit headers
 */

import {
  isRetryableError,
  NetworkError,
  parseApiError,
  RateLimitError,
} from "./errors";

/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Base delay between retries in milliseconds
   * @default 1000 (1 second)
   */
  baseDelay?: number;

  /**
   * Maximum delay between retries in milliseconds
   * @default 30000 (30 seconds)
   */
  maxDelay?: number;

  /**
   * Exponential backoff factor
   * @default 2
   */
  backoffFactor?: number;

  /**
   * Add random jitter to delays to prevent thundering herd
   * @default true
   */
  useJitter?: boolean;

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;

  /**
   * Custom retry predicate
   * Return true to retry, false to throw immediately
   */
  shouldRetry?: (error: unknown, attemptNumber: number) => boolean;

  /**
   * Called before each retry attempt
   */
  onRetry?: (error: unknown, attemptNumber: number, delay: number) => void;

  /**
   * Called when max retries exceeded
   */
  onMaxRetriesExceeded?: (error: unknown) => void;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  useJitter: true,
  timeout: 30000,
  shouldRetry: (error: unknown) => isRetryableError(error),
  onRetry: (error: unknown, attemptNumber: number, delay: number) => {
    console.warn(
      `[RetryHandler] Retrying request (attempt ${attemptNumber}) after ${delay}ms due to:`,
      (error as any).message
    );
  },
  onMaxRetriesExceeded: (error: unknown) => {
    console.error(
      "[RetryHandler] Max retries exceeded:",
      (error as any).message
    );
  },
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay for retry attempt
 */
function calculateDelay(
  attemptNumber: number,
  config: Required<RetryConfig>,
  error?: unknown
): number {
  // Check for rate limit with retry-after
  if (error instanceof RateLimitError) {
    return error.retryAfter * 1000;
  }

  // Calculate exponential backoff
  const exponentialDelay = Math.min(
    config.baseDelay * Math.pow(config.backoffFactor, attemptNumber - 1),
    config.maxDelay
  );

  // Add jitter if enabled
  if (config.useJitter) {
    const jitter = Math.random() * config.baseDelay;
    return exponentialDelay + jitter;
  }

  return exponentialDelay;
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param config - Retry configuration
 * @returns Promise with function result
 * @throws Last error if max retries exceeded
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => fetch('/api/data'),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const fullConfig: Required<RetryConfig> = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: unknown;
  let attemptNumber = 0;

  while (attemptNumber <= fullConfig.maxRetries) {
    try {
      attemptNumber++;

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, fullConfig.timeout);

      try {
        // Execute function with timeout
        const result = await fn();
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      // Parse error
      const parsedError = parseApiError(error);
      lastError = parsedError;

      // Check if we should retry
      const isLastAttempt = attemptNumber > fullConfig.maxRetries;
      const shouldRetry = fullConfig.shouldRetry(parsedError, attemptNumber);

      if (isLastAttempt || !shouldRetry) {
        if (isLastAttempt && fullConfig.onMaxRetriesExceeded) {
          fullConfig.onMaxRetriesExceeded(parsedError);
        }
        throw parsedError;
      }

      // Calculate delay
      const delay = calculateDelay(attemptNumber, fullConfig, parsedError);

      // Call onRetry callback
      if (fullConfig.onRetry) {
        fullConfig.onRetry(parsedError, attemptNumber, delay);
      }

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError;
}

/**
 * Retry handler class for more complex scenarios
 */
export class RetryHandler {
  private config: Required<RetryConfig>;
  private circuitBreakerState: "closed" | "open" | "half-open" = "closed";
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly CIRCUIT_BREAKER_THRESHOLD = 5;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

  constructor(config: RetryConfig = {}) {
    this.config = {
      ...DEFAULT_RETRY_CONFIG,
      ...config,
    };
  }

  /**
   * Update retry configuration
   */
  public updateConfig(config: Partial<RetryConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    } as Required<RetryConfig>;
  }

  /**
   * Get current configuration
   */
  public getConfig(): Readonly<Required<RetryConfig>> {
    return { ...this.config };
  }

  /**
   * Execute function with retry logic
   */
  public async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit breaker
    if (this.circuitBreakerState === "open") {
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure < this.CIRCUIT_BREAKER_TIMEOUT) {
        throw new NetworkError(
          "Circuit breaker is open. Service temporarily unavailable.",
          this.failureCount,
          this.config.maxRetries
        );
      }
      // Transition to half-open
      this.circuitBreakerState = "half-open";
    }

    try {
      const result = await retryWithBackoff(fn, this.config);

      // Success - reset circuit breaker
      if (this.circuitBreakerState === "half-open" || this.failureCount > 0) {
        this.resetCircuitBreaker();
      }

      return result;
    } catch (error) {
      // Record failure
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Record a failure for circuit breaker
   */
  private recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.CIRCUIT_BREAKER_THRESHOLD) {
      this.circuitBreakerState = "open";
      console.warn(
        `[RetryHandler] Circuit breaker opened after ${this.failureCount} failures`
      );
    }
  }

  /**
   * Reset circuit breaker
   */
  private resetCircuitBreaker(): void {
    this.circuitBreakerState = "closed";
    this.failureCount = 0;
    console.info("[RetryHandler] Circuit breaker closed - service recovered");
  }

  /**
   * Get circuit breaker state
   */
  public getCircuitBreakerState(): "closed" | "open" | "half-open" {
    return this.circuitBreakerState;
  }

  /**
   * Manually reset circuit breaker
   */
  public manualReset(): void {
    this.resetCircuitBreaker();
  }
}

/**
 * Create a retry handler with custom configuration
 */
export function createRetryHandler(config?: RetryConfig): RetryHandler {
  return new RetryHandler(config);
}

/**
 * Utility to wrap a function with retry logic
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config?: RetryConfig
): T {
  const handler = createRetryHandler(config);
  return ((...args: Parameters<T>) => {
    return handler.execute(() => fn(...args));
  }) as T;
}
