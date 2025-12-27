import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { RealtimeGateway } from '@realtime/realtime.gateway';
import { WsRateLimitGuard } from '@common/guards/ws-rate-limit.guard';
import { WsRoomLimitGuard } from '@common/guards/ws-room-limit.guard';

/**
 * WebSocket Monitor Service
 *
 * Monitors WebSocket connections, rooms, and resource usage
 * Provides metrics for observability and alerts for anomalies
 *
 * Features:
 * - Connection count monitoring
 * - Room usage tracking
 * - Rate limit statistics
 * - Memory leak detection
 * - Performance metrics
 *
 * @class WebSocketMonitorService
 */
@Injectable()
export class WebSocketMonitorService implements OnModuleDestroy {
  private readonly logger = new Logger(WebSocketMonitorService.name);
  private readonly MEMORY_THRESHOLD_MB = 500;
  private readonly CONNECTION_THRESHOLD = 9000; // 90% of max 10000
  
  // Memory optimization: Sliding window for metrics
  private metricsHistory: { timestamp: number; metrics: WebSocketMetrics }[] = [];
  private readonly MAX_HISTORY_SIZE = 60; // 1 hour of history (1 per minute)

  constructor(
    private realtimeGateway: RealtimeGateway,
    private wsRateLimitGuard: WsRateLimitGuard,
    private wsRoomLimitGuard: WsRoomLimitGuard,
  ) {}

  onModuleDestroy() {
    this.metricsHistory = []; // Clear history to free memory
    this.logger.log('WebSocket monitor shutting down');
  }

  /**
   * Periodic health check - runs every 60 seconds
   */
  @Interval(60000)
  async performHealthCheck(): Promise<void> {
    try {
      const metrics = this.getMetrics();

      // Check connection count
      if (metrics.connections.total > this.CONNECTION_THRESHOLD) {
        this.logger.warn(
          `⚠️  Connection count approaching limit: ${metrics.connections.total}/${metrics.connections.max}`,
        );
      }

      // Check memory usage
      const memUsage = process.memoryUsage();
      const heapUsedMB = memUsage.heapUsed / 1024 / 1024;

      if (heapUsedMB > this.MEMORY_THRESHOLD_MB) {
        this.logger.warn(
          `⚠️  High memory usage: ${heapUsedMB.toFixed(2)}MB (threshold: ${this.MEMORY_THRESHOLD_MB}MB)`,
        );
      }

      // Log summary every 5 minutes
      if (Date.now() % 300000 < 60000) {
        this.logger.log(
          `📊 WebSocket Stats: ${metrics.connections.total} connections, ${metrics.rooms.totalRooms} rooms, ${metrics.rateLimits.activeClients} rate-limited clients`,
        );
      }

      // Store metrics in history with sliding window
      this.metricsHistory.push({ timestamp: Date.now(), metrics });
      
      // Enforce sliding window limit (memory optimization)
      if (this.metricsHistory.length > this.MAX_HISTORY_SIZE) {
        this.metricsHistory.shift(); // Remove oldest entry
      }

    } catch (error) {
      this.logger.error('Health check failed:', error);
    }
  }

  /**
   * Get comprehensive WebSocket metrics
   */
  getMetrics(): WebSocketMetrics {
    const rateLimitStats = this.wsRateLimitGuard.getStats();
    const roomLimitStats = this.wsRoomLimitGuard.getStats();

    const memUsage = process.memoryUsage();

    return {
      connections: {
        total: this.realtimeGateway.getConnectedCount(),
        max: 10000,
        utilizationPercent: (this.realtimeGateway.getConnectedCount() / 10000) * 100,
      },
      rooms: {
        totalRooms: this.realtimeGateway.getAllRooms().length,
        maxRoomsPerUser: roomLimitStats.maxRoomsPerUser,
        usersWithRooms: roomLimitStats.totalUsers,
      },
      rateLimits: {
        activeClients: rateLimitStats.totalClients,
        maxEventsPerMinute: rateLimitStats.maxEventsPerMinute,
        clientStats: rateLimitStats.clientStats,
      },
      memory: {
        heapUsedMB: memUsage.heapUsed / 1024 / 1024,
        heapTotalMB: memUsage.heapTotal / 1024 / 1024,
        rssMB: memUsage.rss / 1024 / 1024,
        externalMB: memUsage.external / 1024 / 1024,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get health status
   */
  getHealthStatus(): HealthStatus {
    const metrics = this.getMetrics();
    const issues: string[] = [];

    // Check thresholds
    if (metrics.connections.utilizationPercent > 90) {
      issues.push('Connection limit approaching capacity');
    }

    if (metrics.memory.heapUsedMB > this.MEMORY_THRESHOLD_MB) {
      issues.push('High memory usage detected');
    }

    if (metrics.rateLimits.activeClients > 1000) {
      issues.push('High number of rate-limited clients');
    }

    return {
      status: issues.length === 0 ? 'healthy' : 'degraded',
      issues,
      metrics,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Detect potential memory leaks
   */
  detectMemoryLeaks(): MemoryLeakReport {
    const metrics = this.getMetrics();
    const warnings: string[] = [];

    // Check for disproportionate room count vs connections
    const avgRoomsPerConnection = metrics.rooms.totalRooms / metrics.connections.total;
    if (avgRoomsPerConnection > 10) {
      warnings.push(`Avg ${avgRoomsPerConnection.toFixed(2)} rooms per connection - possible leak`);
    }

    // Check for stale rate limit entries
    if (metrics.rateLimits.activeClients > metrics.connections.total * 2) {
      warnings.push('Rate limit tracking exceeds connection count - possible stale entries');
    }

    // Memory growth check
    const heapPercent = (metrics.memory.heapUsedMB / metrics.memory.heapTotalMB) * 100;
    if (heapPercent > 85) {
      warnings.push(`Heap usage at ${heapPercent.toFixed(1)}% - approaching limit`);
    }

    return {
      detected: warnings.length > 0,
      warnings,
      metrics: {
        avgRoomsPerConnection,
        heapUtilizationPercent: heapPercent,
        rateLimitToConnectionRatio: metrics.rateLimits.activeClients / metrics.connections.total,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Force cleanup of stale data
   */
  async forceCleanup(): Promise<CleanupReport> {
    this.logger.log('🧹 Forcing cleanup of WebSocket resources...');

    const beforeMetrics = this.getMetrics();

    // Trigger garbage collection if available
    if (global.gc) {
      global.gc();
      this.logger.log('Manual GC triggered');
    }

    const afterMetrics = this.getMetrics();

    const freedMemoryMB =
      beforeMetrics.memory.heapUsedMB - afterMetrics.memory.heapUsedMB;

    return {
      before: beforeMetrics,
      after: afterMetrics,
      freedMemoryMB,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Type definitions
 */
export interface WebSocketMetrics {
  connections: {
    total: number;
    max: number;
    utilizationPercent: number;
  };
  rooms: {
    totalRooms: number;
    maxRoomsPerUser: number;
    usersWithRooms: number;
  };
  rateLimits: {
    activeClients: number;
    maxEventsPerMinute: number;
    clientStats: Array<{ id: string; count: number; remaining: number }>;
  };
  memory: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
    externalMB: number;
  };
  timestamp: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  issues: string[];
  metrics: WebSocketMetrics;
  timestamp: string;
}

export interface MemoryLeakReport {
  detected: boolean;
  warnings: string[];
  metrics: {
    avgRoomsPerConnection: number;
    heapUtilizationPercent: number;
    rateLimitToConnectionRatio: number;
  };
  timestamp: string;
}

export interface CleanupReport {
  before: WebSocketMetrics;
  after: WebSocketMetrics;
  freedMemoryMB: number;
  timestamp: string;
}
