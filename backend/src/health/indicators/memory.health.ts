import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import * as os from 'os';

/**
 * Memory health indicator
 * Monitors system and process memory usage
 */
@Injectable()
export class MemoryHealthIndicator extends HealthIndicator {
  private readonly THRESHOLD_PERCENT = 90; // Alert when memory is 90% used
  private readonly WARNING_PERCENT = 80; // Warn when memory is 80% used

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const systemMemory = this.getSystemMemory();
      const processMemory = this.getProcessMemory();

      const systemUsedPercent =
        ((systemMemory.total - systemMemory.free) / systemMemory.total) * 100;
      const heapUsedPercent =
        (processMemory.heapUsed / processMemory.heapTotal) * 100;

      const isHealthy =
        systemUsedPercent < this.THRESHOLD_PERCENT &&
        heapUsedPercent < this.THRESHOLD_PERCENT;

      const status = {
        system: {
          total: this.formatBytes(systemMemory.total),
          free: this.formatBytes(systemMemory.free),
          used: this.formatBytes(systemMemory.total - systemMemory.free),
          usedPercent: `${systemUsedPercent.toFixed(2)}%`,
        },
        process: {
          heapTotal: this.formatBytes(processMemory.heapTotal),
          heapUsed: this.formatBytes(processMemory.heapUsed),
          heapUsedPercent: `${heapUsedPercent.toFixed(2)}%`,
          rss: this.formatBytes(processMemory.rss),
          external: this.formatBytes(processMemory.external),
        },
        status:
          Math.max(systemUsedPercent, heapUsedPercent) >= this.THRESHOLD_PERCENT
            ? 'critical'
            : Math.max(systemUsedPercent, heapUsedPercent) >=
              this.WARNING_PERCENT
            ? 'warning'
            : 'healthy',
      };

      if (!isHealthy) {
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
