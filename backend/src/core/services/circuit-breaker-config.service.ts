import { Injectable } from '@nestjs/common';

/**
 * CircuitBreakerConfigService
 *
 * Provides globally injectable access to circuit breaker configuration.
 * Consolidates failure thresholds, timeouts, and reset settings.
 */
@Injectable()
export class CircuitBreakerConfigService {
  // Default Circuit Breaker Settings
  get failureThreshold(): number {
    return 5;
  }

  get successThreshold(): number {
    return 3;
  }

  get timeoutMs(): number {
    return 30000; // 30 seconds
  }

  get resetTimeoutMs(): number {
    return 60000; // 60 seconds
  }

  get halfOpenMaxAttempts(): number {
    return 3;
  }

  // Service-specific configurations
  getServiceConfig(serviceName: string): CircuitBreakerOptions {
    const configs: Record<string, CircuitBreakerOptions> = {
      database: {
        failureThreshold: 3,
        successThreshold: 2,
        timeoutMs: 10000,
        resetTimeoutMs: 30000,
      },
      redis: {
        failureThreshold: 5,
        successThreshold: 3,
        timeoutMs: 5000,
        resetTimeoutMs: 15000,
      },
      externalApi: {
        failureThreshold: 5,
        successThreshold: 3,
        timeoutMs: 30000,
        resetTimeoutMs: 60000,
      },
      email: {
        failureThreshold: 3,
        successThreshold: 2,
        timeoutMs: 15000,
        resetTimeoutMs: 120000,
      },
      ocr: {
        failureThreshold: 3,
        successThreshold: 2,
        timeoutMs: 300000, // 5 minutes
        resetTimeoutMs: 180000, // 3 minutes
      },
      pacer: {
        failureThreshold: 3,
        successThreshold: 2,
        timeoutMs: 15000,
        resetTimeoutMs: 300000, // 5 minutes
      },
    };

    return configs[serviceName] || this.getDefaultConfig();
  }

  /**
   * Get default circuit breaker configuration
   */
  getDefaultConfig(): CircuitBreakerOptions {
    return {
      failureThreshold: this.failureThreshold,
      successThreshold: this.successThreshold,
      timeoutMs: this.timeoutMs,
      resetTimeoutMs: this.resetTimeoutMs,
    };
  }

  /**
   * Get summary of all configurations
   */
  getSummary(): Record<string, unknown> {
    return {
      default: this.getDefaultConfig(),
      services: {
        database: this.getServiceConfig('database'),
        redis: this.getServiceConfig('redis'),
        externalApi: this.getServiceConfig('externalApi'),
        email: this.getServiceConfig('email'),
        ocr: this.getServiceConfig('ocr'),
        pacer: this.getServiceConfig('pacer'),
      },
    };
  }
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  resetTimeoutMs: number;
}
