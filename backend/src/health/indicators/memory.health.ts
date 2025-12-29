/**
 * Memory Health Indicator
 * Production-grade memory health checks for system, process, and V8 heap
 *
 * Responsibilities:
 * - Provide detailed memory diagnostics for operators
 * - Enforce warning / critical thresholds
 * - Support both comprehensive and quick checks
 *
 * This indicator is safe for:
 * - Readiness probes
 * - Diagnostic health endpoints
 * - Production monitoring
 */

import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';

import {
  getMemoryStats,
  checkMemoryThresholds,
  DEFAULT_MEMORY_THRESHOLDS,
  MemoryThresholds,
} from '@common/utils/memory-management.utils';

import * as v8 from 'v8';
import * as os from 'os';

/* ------------------------------------------------------------------ */
/* Memory Health Indicator                                             */
/* ------------------------------------------------------------------ */

@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  private thresholds: MemoryThresholds = DEFAULT_MEMORY_THRESHOLDS;

  /* ------------------------------------------------------------------ */
  /* Configuration                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Override default memory thresholds.
   * Intended for environment-specific tuning.
   */
  configure(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /* ------------------------------------------------------------------ */
  /* Comprehensive Health Check                                         */
  /* ------------------------------------------------------------------ */

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const stats = getMemoryStats();
      const { status } = checkMemoryThresholds(this.thresholds);

      const heapStats = v8.getHeapStatistics();
      const heapSpaces = v8.getHeapSpaceStatistics();

      const systemTotal = os.totalmem();
      const systemFree = os.freemem();
      const systemUsed = systemTotal - systemFree;
      const systemUsagePercent = (systemUsed / systemTotal) * 100;

      const result = {
        healthStatus: status,
        process: {
          heapUsed: `${stats.heapUsedMB.toFixed(1)} MB`,
          heapTotal: `${stats.heapTotalMB.toFixed(1)} MB`,
          heapUsagePercent: `${stats.heapUsagePercent.toFixed(1)}%`,
          rss: `${stats.rssMB.toFixed(1)} MB`,
          external: `${(stats.external / 1024 / 1024).toFixed(1)} MB`,
          arrayBuffers: `${(stats.arrayBuffers / 1024 / 1024).toFixed(1)} MB`,
        },
        v8: {
          heapSizeLimit: `${(heapStats.heap_size_limit / 1024 / 1024).toFixed(1)} MB`,
          totalHeapSize: `${(heapStats.total_heap_size / 1024 / 1024).toFixed(1)} MB`,
          usedHeapSize: `${(heapStats.used_heap_size / 1024 / 1024).toFixed(1)} MB`,
          mallocedMemory: `${(heapStats.malloced_memory / 1024 / 1024).toFixed(1)} MB`,
          peakMallocedMemory: `${(heapStats.peak_malloced_memory / 1024 / 1024).toFixed(1)} MB`,
        },
        heapSpaces: heapSpaces.map((space) => ({
          name: space.space_name,
          size: `${(space.space_size / 1024 / 1024).toFixed(1)} MB`,
          used: `${(space.space_used_size / 1024 / 1024).toFixed(1)} MB`,
          available: `${(space.space_available_size / 1024 / 1024).toFixed(1)} MB`,
        })),
        system: {
          total: `${(systemTotal / 1024 / 1024).toFixed(1)} MB`,
          free: `${(systemFree / 1024 / 1024).toFixed(1)} MB`,
          used: `${(systemUsed / 1024 / 1024).toFixed(1)} MB`,
          usagePercent: `${systemUsagePercent.toFixed(1)}%`,
        },
        thresholds: {
          warningPercent: `${this.thresholds.warningPercent}%`,
          criticalPercent: `${this.thresholds.criticalPercent}%`,
          maxHeapMB: `${this.thresholds.maxHeapMB} MB`,
        },
      };

      if (status === 'critical') {
        throw new HealthCheckError(
          'Memory usage critical',
          this.getStatus(key, false, result),
        );
      }

      return this.getStatus(key, true, result);
    } catch (error) {
      if (error instanceof HealthCheckError) {
        throw error;
      }

      const message =
        error instanceof Error ? error.message : 'Unknown memory error';

      throw new HealthCheckError(
        'Memory health check failed',
        this.getStatus(key, false, { error: message }),
      );
    }
  }

  /* ------------------------------------------------------------------ */
  /* Quick Health Check                                                 */
  /* ------------------------------------------------------------------ */

  /**
   * Lightweight memory check with minimal overhead.
   * Suitable for frequent probes (e.g., readiness).
   */
  async quickCheck(key: string): Promise<HealthIndicatorResult> {
    const stats = getMemoryStats();
    const { status } = checkMemoryThresholds(this.thresholds);

    const result = {
      healthStatus: status,
      heapUsagePercent: `${stats.heapUsagePercent.toFixed(1)}%`,
      heapUsed: `${stats.heapUsedMB.toFixed(1)} MB`,
      rss: `${stats.rssMB.toFixed(1)} MB`,
    };

    if (status === 'critical') {
      throw new HealthCheckError(
        'Memory usage critical',
        this.getStatus(key, false, result),
      );
    }

    return this.getStatus(key, true, result);
  }
}
