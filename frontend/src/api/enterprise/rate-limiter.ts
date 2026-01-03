/**
 * Enterprise API Rate Limiter
 * Client-side rate limiting to prevent excessive API calls
 *
 * @module api/enterprise/rate-limiter
 * @description Implements client-side rate limiting including:
 * - Token bucket algorithm
 * - Sliding window rate limiting
 * - Per-endpoint rate limits
 * - Global rate limiting
 * - Queue management for throttled requests
 *
 * @performance
 * - Prevents unnecessary server load
 * - Reduces 429 errors
 * - Implements request queuing
 */

import { RateLimitError } from "./errors";

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum requests per window
   * @default 100
   */
  maxRequests?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  windowMs?: number;

  /**
   * Maximum queue size for throttled requests
   * @default 50
   */
  maxQueueSize?: number;

  /**
   * Enable request queuing
   * @default true
   */
  enableQueuing?: boolean;

  /**
   * Per-endpoint overrides
   * Key: endpoint pattern (e.g., "/cases/*")
   * Value: { maxRequests, windowMs }
   */
  endpointLimits?: Record<string, { maxRequests: number; windowMs: number }>;
}

/**
 * Request info for tracking
 */
interface RequestInfo {
  timestamp: number;
  endpoint: string;
}

/**
 * Queued request
 */
interface QueuedRequest {
  endpoint: string;
  execute: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  addedAt: number;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private requests: RequestInfo[] = [];
  private queue: QueuedRequest[] = [];
  private processing: boolean = false;
  private config: Required<RateLimitConfig>;
  private endpointRequests: Map<string, RequestInfo[]> = new Map();

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      maxRequests: config.maxRequests ?? 100,
      windowMs: config.windowMs ?? 60000,
      maxQueueSize: config.maxQueueSize ?? 50,
      enableQueuing: config.enableQueuing ?? true,
      endpointLimits: config.endpointLimits ?? {},
    };
  }

  /**
   * Update rate limit configuration
   */
  public updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      endpointLimits: {
        ...this.config.endpointLimits,
        ...(config.endpointLimits || {}),
      },
    } as Required<RateLimitConfig>;
  }

  /**
   * Get rate limit config for endpoint
   */
  private getEndpointConfig(endpoint: string): {
    maxRequests: number;
    windowMs: number;
  } {
    // Check for exact match
    if (this.config.endpointLimits[endpoint]) {
      return this.config.endpointLimits[endpoint];
    }

    // Check for pattern match
    for (const [pattern, limits] of Object.entries(
      this.config.endpointLimits
    )) {
      if (this.matchesPattern(endpoint, pattern)) {
        return limits;
      }
    }

    // Return default
    return {
      maxRequests: this.config.maxRequests,
      windowMs: this.config.windowMs,
    };
  }

  /**
   * Match endpoint against pattern
   */
  private matchesPattern(endpoint: string, pattern: string): boolean {
    // Convert pattern to regex
    const regexPattern = pattern
      .replace(/\*/g, ".*")
      .replace(/\//g, "\\/")
      .replace(/\?/g, ".");
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(endpoint);
  }

  /**
   * Clean up old requests outside the window
   */
  private cleanupOldRequests(windowMs: number): void {
    const now = Date.now();
    const cutoff = now - windowMs;

    // Clean global requests
    this.requests = this.requests.filter((req) => req.timestamp > cutoff);

    // Clean endpoint-specific requests
    for (const [endpoint, requests] of this.endpointRequests.entries()) {
      const filtered = requests.filter((req) => req.timestamp > cutoff);
      if (filtered.length === 0) {
        this.endpointRequests.delete(endpoint);
      } else {
        this.endpointRequests.set(endpoint, filtered);
      }
    }
  }

  /**
   * Check if request is allowed
   */
  private isAllowed(endpoint: string): {
    allowed: boolean;
    global: boolean;
    endpoint: boolean;
    retryAfter?: number;
  } {
    const config = this.getEndpointConfig(endpoint);
    this.cleanupOldRequests(config.windowMs);

    const now = Date.now();

    // Check global limit
    const globalAllowed = this.requests.length < this.config.maxRequests;

    // Check endpoint-specific limit
    const endpointRequests = this.endpointRequests.get(endpoint) || [];
    const endpointAllowed = endpointRequests.length < config.maxRequests;

    const allowed = globalAllowed && endpointAllowed;

    // Calculate retry after if not allowed
    let retryAfter: number | undefined;
    if (!allowed) {
      if (!globalAllowed && this.requests.length > 0) {
        const oldestRequest = this.requests[0];
        if (oldestRequest) {
          retryAfter = Math.ceil(
            (oldestRequest.timestamp + this.config.windowMs - now) / 1000
          );
        }
      } else if (!endpointAllowed && endpointRequests.length > 0) {
        const oldestRequest = endpointRequests[0];
        if (oldestRequest) {
          retryAfter = Math.ceil(
            (oldestRequest.timestamp + config.windowMs - now) / 1000
          );
        }
      }
    }

    return {
      allowed,
      global: globalAllowed,
      endpoint: endpointAllowed,
      retryAfter,
    };
  }

  /**
   * Record a request
   */
  private recordRequest(endpoint: string): void {
    const now = Date.now();
    const request: RequestInfo = { timestamp: now, endpoint };

    // Record global
    this.requests.push(request);

    // Record endpoint-specific
    const endpointRequests = this.endpointRequests.get(endpoint) || [];
    endpointRequests.push(request);
    this.endpointRequests.set(endpoint, endpointRequests);
  }

  /**
   * Process queued requests
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue[0];
      if (!request) break;

      const status = this.isAllowed(request.endpoint);

      if (status.allowed) {
        // Remove from queue
        this.queue.shift();

        // Record and execute
        this.recordRequest(request.endpoint);
        try {
          const result = await request.execute();
          request.resolve(result);
        } catch () {
          request.reject(error);
        }
      } else {
        // Wait before trying again
        const delay = Math.min((status.retryAfter || 1) * 1000, 5000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.processing = false;
  }

  /**
   * Execute a function with rate limiting
   *
   * @param endpoint - API endpoint being called
   * @param fn - Function to execute
   * @returns Promise with function result
   * @throws RateLimitError if rate limit exceeded and queuing disabled
   */
  public async execute<T>(
    endpoint: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const status = this.isAllowed(endpoint);

    if (status.allowed) {
      // Execute immediately
      this.recordRequest(endpoint);
      return await fn();
    }

    // Rate limit exceeded
    if (!this.config.enableQueuing) {
      throw new RateLimitError(
        status.retryAfter,
        this.config.maxRequests,
        0,
        new Date(Date.now() + (status.retryAfter || 60) * 1000)
      );
    }

    // Queue request
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new RateLimitError(
        status.retryAfter,
        this.config.maxRequests,
        0,
        new Date(Date.now() + (status.retryAfter || 60) * 1000)
      );
    }

    return new Promise<T>((resolve, reject) => {
      this.queue.push({
        endpoint,
        execute: fn,
        resolve,
        reject,
        addedAt: Date.now(),
      });

      // Start processing queue
      this.processQueue();
    });
  }

  /**
   * Get current rate limit status
   */
  public getStatus(endpoint?: string): {
    requests: number;
    limit: number;
    remaining: number;
    resetAt: Date;
    queueSize: number;
  } {
    if (endpoint) {
      const config = this.getEndpointConfig(endpoint);
      this.cleanupOldRequests(config.windowMs);
      const endpointRequests = this.endpointRequests.get(endpoint) || [];
      const oldest = endpointRequests[0];

      return {
        requests: endpointRequests.length,
        limit: config.maxRequests,
        remaining: Math.max(0, config.maxRequests - endpointRequests.length),
        resetAt: oldest
          ? new Date(oldest.timestamp + config.windowMs)
          : new Date(),
        queueSize: this.queue.filter((q) => q.endpoint === endpoint).length,
      };
    }

    // Global status
    this.cleanupOldRequests(this.config.windowMs);
    const oldest = this.requests[0];

    return {
      requests: this.requests.length,
      limit: this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - this.requests.length),
      resetAt: oldest
        ? new Date(oldest.timestamp + this.config.windowMs)
        : new Date(),
      queueSize: this.queue.length,
    };
  }

  /**
   * Clear all rate limit data
   */
  public reset(): void {
    this.requests = [];
    this.endpointRequests.clear();
    this.queue = [];
  }

  /**
   * Clear queue
   */
  public clearQueue(): void {
    // Reject all queued requests
    for (const request of this.queue) {
      request.reject(
        new RateLimitError(60, this.config.maxRequests, 0, new Date())
      );
    }
    this.queue = [];
  }
}

/**
 * Global rate limiter instance
 */
export const globalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60000,
  enableQueuing: true,
  maxQueueSize: 50,
  endpointLimits: {
    "/auth/*": { maxRequests: 10, windowMs: 60000 },
    "/search/*": { maxRequests: 30, windowMs: 60000 },
    "/analytics/*": { maxRequests: 50, windowMs: 60000 },
  },
});

/**
 * Create a custom rate limiter
 */
export function createRateLimiter(config?: RateLimitConfig): RateLimiter {
  return new RateLimiter(config);
}
