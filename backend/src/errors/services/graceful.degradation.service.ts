import { Injectable, Logger } from '@nestjs/common';
import { CircuitBreakerService, CircuitState } from '@common/services/circuit-breaker.service';

/**
 * Service Health Status
 */
export enum ServiceHealth {
  HEALTHY = 'HEALTHY',
  DEGRADED = 'DEGRADED',
  UNHEALTHY = 'UNHEALTHY',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Fallback Strategy
 */
export enum FallbackStrategy {
  CACHED_RESPONSE = 'CACHED_RESPONSE',
  DEFAULT_RESPONSE = 'DEFAULT_RESPONSE',
  PARTIAL_RESPONSE = 'PARTIAL_RESPONSE',
  EMPTY_RESPONSE = 'EMPTY_RESPONSE',
  THROW_ERROR = 'THROW_ERROR',
}

/**
 * Service Health Metrics
 */
export interface ServiceHealthMetrics {
  serviceName: string;
  status: ServiceHealth;
  uptime: number;
  lastCheck: string;
  successRate: number;
  averageResponseTime: number;
  errorCount: number;
  circuitState: CircuitState;
}

/**
 * Fallback Response
 */
export interface FallbackResponse<T> {
  data: T;
  isFallback: boolean;
  strategy: FallbackStrategy;
  reason: string;
  timestamp: string;
}

/**
 * Degradation Config
 */
export interface DegradationConfig {
  enableCircuitBreaker: boolean;
  enableFallback: boolean;
  fallbackStrategy: FallbackStrategy;
  fallbackData?: unknown;
  cacheKey?: string;
  healthCheckInterval?: number;
}

/**
 * Graceful Degradation Service
 * Implements circuit breaker, fallback strategies, and service health tracking
 * Ensures system remains functional even when dependencies fail
 */
@Injectable()
export class GracefulDegradationService {
  private readonly logger = new Logger(GracefulDegradationService.name);
  private serviceHealth: Map<string, ServiceHealthMetrics> = new Map();
  private responseCache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private readonly cacheTTL = 300000; // 5 minutes

  constructor(private readonly circuitBreaker: CircuitBreakerService) {
    this.startHealthMonitoring();
  }

  /**
   * Execute function with graceful degradation
   */
  async executeWithDegradation<T>(
    serviceName: string,
    fn: () => Promise<T>,
    config: DegradationConfig,
  ): Promise<FallbackResponse<T>> {
    const startTime = Date.now();

    try {
      // Check circuit breaker if enabled
      if (config.enableCircuitBreaker) {
        const result = await this.circuitBreaker.execute(serviceName, fn);
        this.recordSuccess(serviceName, Date.now() - startTime);

        // Cache successful response
        if (config.cacheKey) {
          this.cacheResponse(config.cacheKey, result);
        }

        return {
          data: result,
          isFallback: false,
          strategy: FallbackStrategy.THROW_ERROR,
          reason: 'Success',
          timestamp: new Date().toISOString(),
        };
      } else {
        const result = await fn();
        this.recordSuccess(serviceName, Date.now() - startTime);

        if (config.cacheKey) {
          this.cacheResponse(config.cacheKey, result);
        }

        return {
          data: result,
          isFallback: false,
          strategy: FallbackStrategy.THROW_ERROR,
          reason: 'Success',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.recordFailure(serviceName);

      // Apply fallback if enabled
      if (config.enableFallback) {
        const fallbackResponse = await this.applyFallback<T>(
          serviceName,
          config,
          error as Error,
        );

        this.logger.warn(
          `Service ${serviceName} failed, using fallback: ${config.fallbackStrategy}`,
          { error: error instanceof Error ? error.message : String(error) },
        );

        return fallbackResponse;
      }

      // Re-throw if no fallback
      throw error;
    }
  }

  /**
   * Get service health status
   */
  getServiceHealth(serviceName: string): ServiceHealthMetrics {
    const metrics = this.serviceHealth.get(serviceName);

    if (!metrics) {
      return {
        serviceName,
        status: ServiceHealth.UNKNOWN,
        uptime: 0,
        lastCheck: new Date().toISOString(),
        successRate: 0,
        averageResponseTime: 0,
        errorCount: 0,
        circuitState: CircuitState.CLOSED,
      };
    }

    return metrics;
  }

  /**
   * Get all service health metrics
   */
  getAllServiceHealth(): ServiceHealthMetrics[] {
    return Array.from(this.serviceHealth.values());
  }

  /**
   * Check system-wide health
   */
  getSystemHealth(): {
    overallStatus: ServiceHealth;
    services: ServiceHealthMetrics[];
    degradedServices: string[];
    unhealthyServices: string[];
  } {
    const services = this.getAllServiceHealth();
    const degradedServices = services
      .filter((s) => s.status === ServiceHealth.DEGRADED)
      .map((s) => s.serviceName);
    const unhealthyServices = services
      .filter((s) => s.status === ServiceHealth.UNHEALTHY)
      .map((s) => s.serviceName);

    let overallStatus = ServiceHealth.HEALTHY;

    if (unhealthyServices.length > 0) {
      overallStatus = ServiceHealth.UNHEALTHY;
    } else if (degradedServices.length > 0) {
      overallStatus = ServiceHealth.DEGRADED;
    }

    return {
      overallStatus,
      services,
      degradedServices,
      unhealthyServices,
    };
  }

  /**
   * Manually mark service as degraded
   */
  markServiceDegraded(serviceName: string, reason: string): void {
    const metrics = this.getOrCreateMetrics(serviceName);
    metrics.status = ServiceHealth.DEGRADED;
    this.serviceHealth.set(serviceName, metrics);

    this.logger.warn(`Service ${serviceName} marked as degraded: ${reason}`);
  }

  /**
   * Manually mark service as healthy
   */
  markServiceHealthy(serviceName: string): void {
    const metrics = this.getOrCreateMetrics(serviceName);
    metrics.status = ServiceHealth.HEALTHY;
    metrics.errorCount = 0;
    this.serviceHealth.set(serviceName, metrics);

    this.logger.log(`Service ${serviceName} marked as healthy`);
  }

  /**
   * Clear cached responses
   */
  clearCache(cacheKey?: string): void {
    if (cacheKey) {
      this.responseCache.delete(cacheKey);
      this.logger.debug(`Cache cleared for key: ${cacheKey}`);
    } else {
      this.responseCache.clear();
      this.logger.debug('All cache cleared');
    }
  }

  private async applyFallback<T>(
    serviceName: string,
    config: DegradationConfig,
    error: Error,
  ): Promise<FallbackResponse<T>> {
    const timestamp = new Date().toISOString();

    switch (config.fallbackStrategy) {
      case FallbackStrategy.CACHED_RESPONSE:
        return this.getCachedResponse<T>(
          config.cacheKey!,
          serviceName,
          error,
          timestamp,
        );

      case FallbackStrategy.DEFAULT_RESPONSE:
        return {
          data: config.fallbackData as T,
          isFallback: true,
          strategy: FallbackStrategy.DEFAULT_RESPONSE,
          reason: `Service ${serviceName} unavailable: ${error.message}`,
          timestamp,
        };

      case FallbackStrategy.PARTIAL_RESPONSE:
        return {
          data: this.getPartialResponse<T>(config.fallbackData),
          isFallback: true,
          strategy: FallbackStrategy.PARTIAL_RESPONSE,
          reason: `Partial data returned due to service failure: ${error.message}`,
          timestamp,
        };

      case FallbackStrategy.EMPTY_RESPONSE:
        return {
          data: this.getEmptyResponse<T>(),
          isFallback: true,
          strategy: FallbackStrategy.EMPTY_RESPONSE,
          reason: `Empty response due to service failure: ${error.message}`,
          timestamp,
        };

      case FallbackStrategy.THROW_ERROR:
      default:
        throw error;
    }
  }

  private getCachedResponse<T>(
    cacheKey: string,
    serviceName: string,
    error: Error,
    timestamp: string,
  ): FallbackResponse<T> {
    const cached = this.responseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      this.logger.log(
        `Returning cached response for ${serviceName} (age: ${Date.now() - cached.timestamp}ms)`,
      );

      return {
        data: cached.data as T,
        isFallback: true,
        strategy: FallbackStrategy.CACHED_RESPONSE,
        reason: `Using cached data due to service failure: ${error.message}`,
        timestamp,
      };
    }

    this.logger.warn(`No valid cache found for ${serviceName}, throwing error`);
    throw error;
  }

  private getPartialResponse<T>(fallbackData: unknown): T {
    // Return partial data structure
    return {
      ...(fallbackData || {}),
      isPartial: true,
    } as T;
  }

  private getEmptyResponse<T>(): T {
    // Return appropriate empty structure
    return (Array.isArray({}) ? [] : {}) as T;
  }

  private cacheResponse(cacheKey: string, data: unknown): void {
    this.responseCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    // Limit cache size
    if (this.responseCache.size > 1000) {
      const firstKey = this.responseCache.keys().next().value;
      if (firstKey) this.responseCache.delete(firstKey);
    }
  }

  private recordSuccess(serviceName: string, responseTime: number): void {
    const metrics = this.getOrCreateMetrics(serviceName);

    // Update metrics
    metrics.uptime++;
    metrics.lastCheck = new Date().toISOString();
    metrics.averageResponseTime =
      (metrics.averageResponseTime * (metrics.uptime - 1) + responseTime) /
      metrics.uptime;

    // Calculate success rate
    const totalRequests = metrics.uptime + metrics.errorCount;
    metrics.successRate = (metrics.uptime / totalRequests) * 100;

    // Update health status
    if (metrics.successRate >= 95) {
      metrics.status = ServiceHealth.HEALTHY;
    } else if (metrics.successRate >= 70) {
      metrics.status = ServiceHealth.DEGRADED;
    } else {
      metrics.status = ServiceHealth.UNHEALTHY;
    }

    // Get circuit state
    metrics.circuitState =
      this.circuitBreaker.getState(serviceName) || CircuitState.CLOSED;

    this.serviceHealth.set(serviceName, metrics);
  }

  private recordFailure(serviceName: string): void {
    const metrics = this.getOrCreateMetrics(serviceName);

    metrics.errorCount++;
    metrics.lastCheck = new Date().toISOString();

    // Calculate success rate
    const totalRequests = metrics.uptime + metrics.errorCount;
    metrics.successRate = totalRequests > 0 ? (metrics.uptime / totalRequests) * 100 : 0;

    // Update health status
    if (metrics.successRate >= 95) {
      metrics.status = ServiceHealth.HEALTHY;
    } else if (metrics.successRate >= 70) {
      metrics.status = ServiceHealth.DEGRADED;
    } else {
      metrics.status = ServiceHealth.UNHEALTHY;
    }

    // Get circuit state
    metrics.circuitState =
      this.circuitBreaker.getState(serviceName) || CircuitState.CLOSED;

    this.serviceHealth.set(serviceName, metrics);

    this.logger.warn(
      `Service ${serviceName} failure recorded. Success rate: ${metrics.successRate.toFixed(2)}%`,
    );
  }

  private getOrCreateMetrics(serviceName: string): ServiceHealthMetrics {
    if (!this.serviceHealth.has(serviceName)) {
      this.serviceHealth.set(serviceName, {
        serviceName,
        status: ServiceHealth.HEALTHY,
        uptime: 0,
        lastCheck: new Date().toISOString(),
        successRate: 100,
        averageResponseTime: 0,
        errorCount: 0,
        circuitState: CircuitState.CLOSED,
      });
    }

    return this.serviceHealth.get(serviceName)!;
  }

  private startHealthMonitoring(): void {
    // Periodic health check every 30 seconds
    setInterval(() => {
      this.performHealthChecks();
    }, 30000);
  }

  private performHealthChecks(): void {
    const systemHealth = this.getSystemHealth();

    if (systemHealth.overallStatus === ServiceHealth.UNHEALTHY) {
      this.logger.error(
        `System health check: UNHEALTHY - ${systemHealth.unhealthyServices.length} unhealthy services`,
        { unhealthyServices: systemHealth.unhealthyServices },
      );
    } else if (systemHealth.overallStatus === ServiceHealth.DEGRADED) {
      this.logger.warn(
        `System health check: DEGRADED - ${systemHealth.degradedServices.length} degraded services`,
        { degradedServices: systemHealth.degradedServices },
      );
    } else {
      this.logger.debug('System health check: HEALTHY');
    }

    // Auto-recovery: Reset error counts for services that haven't failed recently
    const now = Date.now();
    this.serviceHealth.forEach((metrics, serviceName) => {
      const lastCheckTime = new Date(metrics.lastCheck).getTime();
      const timeSinceLastCheck = now - lastCheckTime;

      // If no activity for 5 minutes, reset metrics
      if (timeSinceLastCheck > 300000) {
        this.logger.debug(
          `Auto-resetting metrics for inactive service: ${serviceName}`,
        );
        this.serviceHealth.delete(serviceName);
      }
    });
  }
}
