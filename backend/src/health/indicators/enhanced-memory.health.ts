/**
 * Enhanced Memory Health Indicator
 * Production-ready health checks for memory management
 * 
 * @module health/indicators/enhanced-memory.health
 */

import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { 
  getMemoryStats, 
  checkMemoryThresholds, 
  DEFAULT_MEMORY_THRESHOLDS,
  MemoryThresholds,
} from '@common/utils/memory-management.utils';
import * as v8 from 'v8';
import * as os from 'os';

@Injectable()
export class EnhancedMemoryHealthIndicator extends HealthIndicator {
  private thresholds: MemoryThresholds = DEFAULT_MEMORY_THRESHOLDS;
  
  /**
   * Configure memory thresholds
   */
  configure(thresholds: Partial<MemoryThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
  
  /**
   * Check memory health with detailed metrics
   */
  async check(key: string): Promise<HealthIndicatorResult> {
    const stats = getMemoryStats();
    const { status } = checkMemoryThresholds(this.thresholds);
    const heapStats = v8.getHeapStatistics();
    const heapSpaces = v8.getHeapSpaceStatistics();
    
    const systemMemory = {
      total: os.totalmem() / (1024 * 1024),
      free: os.freemem() / (1024 * 1024),
      used: (os.totalmem() - os.freemem()) / (1024 * 1024),
      usagePercent: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100,
    };
    
    const result = {
      status: status === 'ok' ? 'up' : status === 'warning' ? 'degraded' : 'down',
      process: {
        heapUsed: `${stats.heapUsedMB.toFixed(1)}MB`,
        heapTotal: `${stats.heapTotalMB.toFixed(1)}MB`,
        heapUsagePercent: `${stats.heapUsagePercent.toFixed(1)}%`,
        rss: `${stats.rssMB.toFixed(1)}MB`,
        external: `${(stats.external / 1024 / 1024).toFixed(1)}MB`,
        arrayBuffers: `${(stats.arrayBuffers / 1024 / 1024).toFixed(1)}MB`,
      },
      v8: {
        totalHeapSize: `${(heapStats.total_heap_size / 1024 / 1024).toFixed(1)}MB`,
        usedHeapSize: `${(heapStats.used_heap_size / 1024 / 1024).toFixed(1)}MB`,
        heapSizeLimit: `${(heapStats.heap_size_limit / 1024 / 1024).toFixed(1)}MB`,
        mallocedMemory: `${(heapStats.malloced_memory / 1024 / 1024).toFixed(1)}MB`,
        peakMallocedMemory: `${(heapStats.peak_malloced_memory / 1024 / 1024).toFixed(1)}MB`,
      },
      heapSpaces: heapSpaces.map((space) => ({
        name: space.space_name,
        size: `${(space.space_size / 1024 / 1024).toFixed(1)}MB`,
        used: `${(space.space_used_size / 1024 / 1024).toFixed(1)}MB`,
        available: `${(space.space_available_size / 1024 / 1024).toFixed(1)}MB`,
      })),
      system: {
        total: `${systemMemory.total.toFixed(1)}MB`,
        free: `${systemMemory.free.toFixed(1)}MB`,
        used: `${systemMemory.used.toFixed(1)}MB`,
        usagePercent: `${systemMemory.usagePercent.toFixed(1)}%`,
      },
      thresholds: {
        warning: `${this.thresholds.warningPercent}%`,
        critical: `${this.thresholds.criticalPercent}%`,
        maxHeap: `${this.thresholds.maxHeapMB}MB`,
      },
      healthStatus: status,
    };
    
    if (status === 'critical') {
      throw new HealthCheckError(
        'Memory usage critical',
        this.getStatus(key, false, result),
      );
    }
    
    return this.getStatus(key, true, result);
  }
  
  /**
   * Quick memory check (minimal overhead)
   */
  async quickCheck(key: string): Promise<HealthIndicatorResult> {
    const stats = getMemoryStats();
    const { status } = checkMemoryThresholds(this.thresholds);
    
    const result = {
      status: status === 'ok' ? 'healthy' : status,
      heapUsagePercent: `${stats.heapUsagePercent.toFixed(1)}%`,
      heapUsed: `${stats.heapUsedMB.toFixed(1)}MB`,
      rss: `${stats.rssMB.toFixed(1)}MB`,
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
