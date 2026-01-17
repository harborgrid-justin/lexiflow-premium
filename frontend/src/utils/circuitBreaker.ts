/**
 * @module utils/circuitBreaker
 * @category Utils - Resilience
 * @description Circuit breaker pattern implementation for fault tolerance with CLOSED/OPEN/HALF_OPEN states.
 * Prevents cascading failures by opening circuit after threshold failures, waiting recovery timeout before
 * trying HALF_OPEN state. Provides execute wrapper for async operations with automatic state management
 * and failure counting.
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

interface CircuitOptions {
  failureThreshold: number; // Number of failures before opening
  recoveryTimeout: number; // Time in ms to wait before trying HALF_OPEN
}

// ============================================================================
// CIRCUIT BREAKER CLASS
// ============================================================================
export class CircuitBreaker {
  private state: CircuitState = "CLOSED";
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly options: CircuitOptions;

  constructor(
    options: CircuitOptions = { failureThreshold: 3, recoveryTimeout: 10000 },
  ) {
    this.options = options;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (Date.now() - this.lastFailureTime > this.options.recoveryTimeout) {
        this.state = "HALF_OPEN";
      } else {
        throw new Error(
          "CircuitBreaker: Service is currently unavailable (Circuit OPEN).",
        );
      }
    }

    try {
      const result = await fn();
      if (this.state === "HALF_OPEN") {
        this.reset();
      }
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.options.failureThreshold) {
      this.state = "OPEN";
      console.warn("CircuitBreaker: Threshold reached. Circuit Opened.");
    }
  }

  private reset() {
    this.state = "CLOSED";
    this.failureCount = 0;
    console.warn("CircuitBreaker: Service recovered. Circuit Closed.");
  }

  getState(): CircuitState {
    return this.state;
  }
}

export const apiCircuitBreaker = new CircuitBreaker();
