import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import * as os from 'os';
import * as v8 from 'v8';

/**
 * Enhanced Memory Health Indicator
 * Monitors system, process, and V8 heap memory with enterprise thresholds
 */
@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  private readonly THRESHOLD_PERCENT = 85;
  private readonly WARNING_PERCENT = 75;
  private readonly CRITICAL_RSS_MB = 2048;
  private readonly WARNING_RSS_MB = 1536;

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const systemMemory = this.getSystemMemory();
      const processMemory = this.getProcessMemory();
      const v8Memory = this.getV8Memory();

      const systemUsedPercent =
        ((systemMemory.total - systemMemory.free) / systemMemory.total) * 100;
      const heapUsedPercent =
        (v8Memory.usedHeapSize / v8Memory.heapSizeLimit) * 100;
      const rssMB = processMemory.rss / 1024 / 1024;

      const isCritical =
        heapUsedPercent >= this.THRESHOLD_PERCENT ||
        rssMB >= this.CRITICAL_RSS_MB;

      const isWarning =
        heapUsedPercent >= this.WARNING_PERCENT ||
        rssMB >= this.WARNING_RSS_MB;

      const status = {
        system: {
          total: this.formatBytes(systemMemory.total),
          free: this.formatBytes(systemMemory.free),
          used: this.formatBytes(systemMemory.total - systemMemory.free),
          usedPercent: `${systemUsedPercent.toFixed(2)}%`,
        },
        v8: {
          heapSizeLimit: this.formatBytes(v8Memory.heapSizeLimit),
          totalHeapSize: this.formatBytes(v8Memory.totalHeapSize),
          usedHeapSize: this.formatBytes(v8Memory.usedHeapSize),
          heapUsedPercent: `${heapUsedPercent.toFixed(2)}%`,
          externalMemory: this.formatBytes(v8Memory.externalMemory),
          numberOfNativeContexts: v8Memory.numberOfNativeContexts,
          numberOfDetachedContexts: v8Memory.numberOfDetachedContexts,
        },
        process: {
          heapTotal: this.formatBytes(processMemory.heapTotal),
          heapUsed: this.formatBytes(processMemory.heapUsed),
          rss: this.formatBytes(processMemory.rss),
          rssMB: `${rssMB.toFixed(2)} MB`,
          external: this.formatBytes(processMemory.external),
          arrayBuffers: this.formatBytes(processMemory.arrayBuffers),
        },
        thresholds: {
          heapWarning: `${this.WARNING_PERCENT}%`,
          heapCritical: `${this.THRESHOLD_PERCENT}%`,
          rssWarning: `${this.WARNING_RSS_MB} MB`,
          rssCritical: `${this.CRITICAL_RSS_MB} MB`,
        },
        status: isCritical
          ? 'critical'
          : isWarning
          ? 'warning'
          : 'healthy',
      };

      if (isCritical) {
        throw new HealthCheckError(
          'Memory usage critical',
          this.getStatus(key, false, status),
        );
      }

      return this.getStatus(key, true, status);
    } catch (error) {
      if (error instanceof HealthCheckError) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Memory health check failed',
        this.getStatus(key, false, { message: errorMessage }),
      );
    }
  }

  private getSystemMemory() {
    return {
      total: os.totalmem(),
      free: os.freemem(),
    };
  }

  private getProcessMemory() {
    const mem = process.memoryUsage();
    return {
      heapTotal: mem.heapTotal,
      heapUsed: mem.heapUsed,
      rss: mem.rss,
      external: mem.external,
      arrayBuffers: mem.arrayBuffers,
    };
  }

  private getV8Memory() {
    const stats = v8.getHeapStatistics();
    return {
      heapSizeLimit: stats.heap_size_limit,
      totalHeapSize: stats.total_heap_size,
      usedHeapSize: stats.used_heap_size,
      externalMemory: stats.external_memory,
      numberOfNativeContexts: stats.number_of_native_contexts,
      numberOfDetachedContexts: stats.number_of_detached_contexts,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
