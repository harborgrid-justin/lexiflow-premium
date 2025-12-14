import { Injectable, Logger } from '@nestjs/common';

/**
 * Retry Configuration
 */
export interface RetryConfig {
  maxAttempts: number;
  initialDelay: number; // milliseconds
  maxDelay: number; // milliseconds
  backoffMultiplier: number;
  retryableErrors?: Array<new (...args: any[]) => Error>;
}

/**
 * Retry Service
 * Implements exponential backoff with jitter for transient failures
 * Prevents thundering herd problem in distributed systems
 * 
 * @example
 * const result = await retryService.execute(
 *   () => this.externalApi.call(),
 *   { maxAttempts: 3, initialDelay: 1000 }
 * );
 */
@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);

  /**
   * Execute function with retry logic
   */
  async execute<T>(
    fn: () => Promise<T>,
    config: Partial<RetryConfig> = {},
  ): Promise<T> {
    const fullConfig = this.mergeWithDefaults(config);
    let lastError: Error;

    for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if error is retryable
        if (fullConfig.retryableErrors && !this.isRetryableError(error, fullConfig)) {
          this.logger.warn(`Non-retryable error encountered: ${lastError.message}`);
          throw error;
        }

        // Don't retry on last attempt
        if (attempt === fullConfig.maxAttempts) {
          this.logger.error(
            `All ${fullConfig.maxAttempts} retry attempts exhausted`,
            lastError.stack,
          );
          break;
        }

        // Calculate delay with exponential backoff and jitter
        const delay = this.calculateDelay(attempt, fullConfig);

        this.logger.warn(
          `Attempt ${attempt}/${fullConfig.maxAttempts} failed. Retrying in ${delay}ms. Error: ${lastError.message}`,
        );

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Execute with custom retry predicate
   */
  async executeWithPredicate<T>(
    fn: () => Promise<T>,
    shouldRetry: (error: Error, attempt: number) => boolean,
    config: Partial<RetryConfig> = {},
  ): Promise<T> {
    const fullConfig = this.mergeWithDefaults(config);
    let lastError: Error;

    for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        if (!shouldRetry(lastError, attempt) || attempt === fullConfig.maxAttempts) {
          break;
        }

        const delay = this.calculateDelay(attempt, fullConfig);
        this.logger.warn(
          `Retry attempt ${attempt}: ${lastError.message} (next in ${delay}ms)`,
        );

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: unknown, config: RetryConfig): boolean {
    if (!config.retryableErrors || config.retryableErrors.length === 0) {
      return true; // Retry all errors if not specified
    }

    return config.retryableErrors.some(
      (ErrorClass) => error instanceof ErrorClass,
    );
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    // Exponential backoff: initialDelay * (backoffMultiplier ^ (attempt - 1))
    const exponentialDelay =
      config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);

    // Cap at maxDelay
    const cappedDelay = Math.min(exponentialDelay, config.maxDelay);

    // Add jitter (±25% random variation) to prevent thundering herd
    const jitter = cappedDelay * 0.25 * (Math.random() - 0.5) * 2;

    return Math.floor(cappedDelay + jitter);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private mergeWithDefaults(config: Partial<RetryConfig>): RetryConfig {
    return {
      maxAttempts: config.maxAttempts ?? 3,
      initialDelay: config.initialDelay ?? 1000,
      maxDelay: config.maxDelay ?? 30000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      retryableErrors: config.retryableErrors,
    };
  }
}
