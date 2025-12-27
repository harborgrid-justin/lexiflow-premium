import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import * as fs from 'fs';
import * as os from 'os';

/**
 * Disk space health indicator
 * Monitors available disk space and warns when threshold is exceeded
 */
@Injectable()
export class DiskHealthIndicator extends HealthIndicator {
  private readonly THRESHOLD_PERCENT = 90; // Alert when disk is 90% full
  private readonly WARNING_PERCENT = 80; // Warn when disk is 80% full

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const diskUsage = await this.getDiskUsage();
      const usedPercent = (diskUsage.used / diskUsage.total) * 100;

      const isHealthy = usedPercent < this.THRESHOLD_PERCENT;
      const status = {
        total: `${this.formatBytes(diskUsage.total)}`,
        used: `${this.formatBytes(diskUsage.used)}`,
        free: `${this.formatBytes(diskUsage.free)}`,
        usedPercent: `${usedPercent.toFixed(2)}%`,
        status: usedPercent >= this.THRESHOLD_PERCENT
          ? 'critical'
          : usedPercent >= this.WARNING_PERCENT
          ? 'warning'
          : 'healthy',
      };

      if (!isHealthy) {
        throw new HealthCheckError(
          'Disk space critical',
          this.getStatus(key, false, status),
        );
      }

      return this.getStatus(key, true, status);
    } catch (error) {
      if (error instanceof HealthCheckError) {
        throw error;
      }
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Disk health check failed',
        this.getStatus(key, false, { message: errorMessage }),
      );
    }
  }

  private async getDiskUsage(): Promise<{
    total: number;
    used: number;
    free: number;
  }> {
    // For Unix-like systems, check the root partition
    if (process.platform !== 'win32') {
      return this.getUnixDiskUsage();
    } else {
      return this.getWindowsDiskUsage();
    }
  }

  private getUnixDiskUsage(): { total: number; used: number; free: number } {
    const stats = fs.statfsSync('/');
    const total = stats.blocks * stats.bsize;
    const free = stats.bfree * stats.bsize;
    const used = total - free;
    return { total, used, free };
  }

  private getWindowsDiskUsage(): { total: number; used: number; free: number } {
    // For Windows, use process.cwd() drive
    const drive = process.cwd().substring(0, 2); // e.g., "C:"
    try {
      const stats = fs.statfsSync(drive);
      const total = stats.blocks * stats.bsize;
      const free = stats.bfree * stats.bsize;
      const used = total - free;
      return { total, used, free };
    } catch {
      // Fallback: use OS totalmem as approximation
      const total = os.totalmem();
      const free = os.freemem();
      const used = total - free;
      return { total, used, free };
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}
