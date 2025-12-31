import { Injectable } from '@nestjs/common';

/**
 * RetryConfigService
 *
 * Provides globally injectable access to retry configuration.
 * Consolidates max attempts, delays, and backoff settings.
 */
/**
 * ╔=================================================================================================================╗
 * ║RETRYCONFIG                                                                                                      ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class RetryConfigService {
  // Default Retry Settings
  get maxAttempts(): number {
    return 3;
  }

  get initialDelayMs(): number {
    return 1000;
  }

  get maxDelayMs(): number {
    return 30000;
  }

  get backoffMultiplier(): number {
    return 2;
  }

  get jitterEnabled(): boolean {
    return true;
  }

  get jitterFactor(): number {
    return 0.2; // 20% jitter
  }

  // Operation-specific configurations
  getOperationConfig(operation: string): RetryOptions {
    const configs: Record<string, RetryOptions> = {
      database: {
        maxAttempts: 3,
        initialDelayMs: 500,
        maxDelayMs: 5000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED'],
      },
      redis: {
        maxAttempts: 3,
        initialDelayMs: 200,
        maxDelayMs: 2000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT'],
      },
      http: {
        maxAttempts: 3,
        initialDelayMs: 1000,
        maxDelayMs: 10000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND'],
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      },
      email: {
        maxAttempts: 5,
        initialDelayMs: 5000,
        maxDelayMs: 300000, // 5 minutes
        backoffMultiplier: 3,
        retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT'],
      },
      webhook: {
        maxAttempts: 3,
        initialDelayMs: 60000, // 1 minute
        maxDelayMs: 900000, // 15 minutes
        backoffMultiplier: 5,
        retryableStatusCodes: [408, 429, 500, 502, 503, 504],
      },
      queue: {
        maxAttempts: 3,
        initialDelayMs: 2000,
        maxDelayMs: 60000,
        backoffMultiplier: 2,
        retryableErrors: ['ECONNRESET'],
      },
    };

    return configs[operation] || this.getDefaultConfig();
  }

  /**
   * Get default retry configuration
   */
  getDefaultConfig(): RetryOptions {
    return {
      maxAttempts: this.maxAttempts,
      initialDelayMs: this.initialDelayMs,
      maxDelayMs: this.maxDelayMs,
      backoffMultiplier: this.backoffMultiplier,
    };
  }

  /**
   * Calculate delay for a specific attempt with exponential backoff
   */
  calculateDelay(attempt: number, config?: RetryOptions): number {
    const c = config || this.getDefaultConfig();
    let delay = c.initialDelayMs * Math.pow(c.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, c.maxDelayMs);

    if (this.jitterEnabled) {
      const jitter = delay * this.jitterFactor * (Math.random() * 2 - 1);
      delay = Math.max(0, delay + jitter);
    }

    return Math.round(delay);
  }

  /**
   * Get summary of all configurations
   */
  getSummary(): Record<string, unknown> {
    return {
      default: this.getDefaultConfig(),
      jitter: { enabled: this.jitterEnabled, factor: this.jitterFactor },
      operations: {
        database: this.getOperationConfig('database'),
        redis: this.getOperationConfig('redis'),
        http: this.getOperationConfig('http'),
        email: this.getOperationConfig('email'),
        webhook: this.getOperationConfig('webhook'),
        queue: this.getOperationConfig('queue'),
      },
    };
  }
}

export interface RetryOptions {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
  retryableStatusCodes?: number[];
}
