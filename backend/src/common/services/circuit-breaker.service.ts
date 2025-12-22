import { Injectable, Logger } from '@nestjs/common';

/**
 * Circuit Breaker States
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, reject requests immediately
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes to close from half-open
  timeout: number; // Time to wait before half-open (ms)
  resetTimeout?: number; // Time to fully reset after close (ms)
}

/**
 * Circuit Breaker Service
 * Implements circuit breaker pattern for external service calls
 * Prevents cascading failures in distributed systems
 * 
 * @example
 * const result = await circuitBreaker.execute(
 *   'pacer-api',
 *   () => this.http.get('https://pacer.gov/api'),
 *   { failureThreshold: 5, timeout: 30000 }
 * );
 */
@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private circuits: Map<string, CircuitBreakerState> = new Map();

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(
    circuitName: string,
    fn: () => Promise<T>,
    config: CircuitBreakerConfig = this.getDefaultConfig(),
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(circuitName, config);

    // Check circuit state
    if (circuit.state === CircuitState.OPEN) {
      if (Date.now() - circuit.lastFailureTime >= config.timeout) {
        this.logger.log(`Circuit ${circuitName} moving to HALF_OPEN`);
        circuit.state = CircuitState.HALF_OPEN;
        circuit.successCount = 0;
      } else {
        const error = new Error(
          `Circuit breaker ${circuitName} is OPEN. Service unavailable.`,
        );
        this.logger.warn(error.message);
        throw error;
      }
    }

    try {
      const result = await fn();
      this.onSuccess(circuit, config);
      return result;
    } catch (error) {
      const _message = error instanceof Error ? error._message : 'Unknown error';
      const _stack = error instanceof Error ? error._stack : undefined;
      this.onFailure(circuit, config, circuitName);
      throw error;
    }
  }

  /**
   * Get circuit state for monitoring
   */
  getState(circuitName: string): CircuitState | undefined {
    return this.circuits.get(circuitName)?.state;
  }

  /**
   * Get circuit metrics for monitoring
   */
  getMetrics(circuitName: string): CircuitBreakerMetrics | undefined {
    const circuit = this.circuits.get(circuitName);
    if (!circuit) return undefined;

    return {
      state: circuit.state,
      failureCount: circuit.failureCount,
      successCount: circuit.successCount,
      lastFailureTime: circuit.lastFailureTime,
    };
  }

  /**
   * Manually reset circuit (for testing or admin intervention)
   */
  reset(circuitName: string): void {
    const circuit = this.circuits.get(circuitName);
    if (circuit) {
      circuit.state = CircuitState.CLOSED;
      circuit.failureCount = 0;
      circuit.successCount = 0;
      circuit.lastFailureTime = 0;
      this.logger.log(`Circuit ${circuitName} manually reset`);
    }
  }

  private getOrCreateCircuit(
    name: string,
    config: CircuitBreakerConfig,
  ): CircuitBreakerState {
    if (!this.circuits.has(name)) {
      this.circuits.set(name, {
        state: CircuitState.CLOSED,
        failureCount: 0,
        successCount: 0,
        lastFailureTime: 0,
        config,
      });
    }
    return this.circuits.get(name)!;
  }

  private onSuccess(
    circuit: CircuitBreakerState,
    config: CircuitBreakerConfig,
  ): void {
    circuit.failureCount = 0;

    if (circuit.state === CircuitState.HALF_OPEN) {
      circuit.successCount++;
      if (circuit.successCount >= config.successThreshold) {
        this.logger.log(`Circuit moving to CLOSED after ${circuit.successCount} successes`);
        circuit.state = CircuitState.CLOSED;
        circuit.successCount = 0;
      }
    }
  }

  private onFailure(
    circuit: CircuitBreakerState,
    config: CircuitBreakerConfig,
    name: string,
  ): void {
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    if (circuit.state === CircuitState.HALF_OPEN) {
      this.logger.warn(`Circuit ${name} reopening after failure in HALF_OPEN state`);
      circuit.state = CircuitState.OPEN;
      circuit.successCount = 0;
    } else if (circuit.failureCount >= config.failureThreshold) {
      this.logger.error(
        `Circuit ${name} opening after ${circuit.failureCount} failures`,
      );
      circuit.state = CircuitState.OPEN;
    }
  }

  private getDefaultConfig(): CircuitBreakerConfig {
    return {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 1 minute
      resetTimeout: 300000, // 5 minutes
    };
  }
}

/**
 * Internal circuit state
 */
interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  config: CircuitBreakerConfig;
}

/**
 * Circuit metrics for monitoring
 */
export interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
}
