import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as v8 from 'v8';
import * as fs from 'fs';

/**
 * Memory Monitoring Service
 * 
 * Enterprise-grade memory monitoring with proactive alerts and automatic cleanup.
 * Tracks heap usage, triggers garbage collection, and prevents memory leaks.
 */
@Injectable()
export class MemoryMonitoringService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MemoryMonitoringService.name);
  private monitoringInterval: NodeJS.Timeout | null = null;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private readonly enabled: boolean;
  private readonly warningThreshold: number;
  private readonly criticalThreshold: number;
  private readonly checkIntervalMs: number;
  private readonly cleanupIntervalMs: number;
  private readonly gcAfterThreshold: boolean;

  constructor(private readonly configService: ConfigService) {
    this.enabled = this.configService.get<boolean>('memory.monitoring.enabled', true);
    this.warningThreshold = this.configService.get<number>('memory.monitoring.warningThreshold', 0.75);
    this.criticalThreshold = this.configService.get<number>('memory.monitoring.criticalThreshold', 0.90);
    this.checkIntervalMs = this.configService.get<number>('memory.monitoring.checkIntervalMs', 30000);
    this.cleanupIntervalMs = this.configService.get<number>('memory.cleanup.intervalMs', 300000);
    this.gcAfterThreshold = this.configService.get<boolean>('memory.monitoring.gcAfterThreshold', true);
  }

  onModuleInit() {
    if (!this.enabled) {
      this.logger.log('Memory monitoring is disabled');
      return;
    }

    this.logger.log('Memory monitoring service initialized');
    this.startMonitoring();
    this.startCleanup();
    this.logInitialMemoryStats();
  }

  onModuleDestroy() {
    this.stopMonitoring();
    this.stopCleanup();
  }

  /**
   * Start continuous memory monitoring
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.checkMemoryUsage();
    }, this.checkIntervalMs);

    this.logger.log(`Memory monitoring started (interval: ${this.checkIntervalMs}ms)`);
  }

  /**
   * Stop memory monitoring
   */
  private stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.logger.log('Memory monitoring stopped');
    }
  }

  /**
   * Start automatic cleanup routine
   */
  private startCleanup(): void {
    const cleanupEnabled = this.configService.get<boolean>('memory.cleanup.enabled', true);
    if (!cleanupEnabled) {
      return;
    }

    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.cleanupIntervalMs);

    this.logger.log(`Automatic cleanup started (interval: ${this.cleanupIntervalMs}ms)`);
  }

  /**
   * Stop automatic cleanup
   */
  private stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      this.logger.log('Automatic cleanup stopped');
    }
  }

  /**
   * Check current memory usage and trigger alerts
   */
  private checkMemoryUsage(): void {
    const heapStats = v8.getHeapStatistics();
    const memoryUsage = process.memoryUsage();
    
    const heapUsedRatio = heapStats.used_heap_size / heapStats.heap_size_limit;
    const externalMemoryMB = memoryUsage.external / 1024 / 1024;
    const rssMemoryMB = memoryUsage.rss / 1024 / 1024;

    if (heapUsedRatio >= this.criticalThreshold) {
      this.logger.error(
        `CRITICAL: Memory usage at ${(heapUsedRatio * 100).toFixed(2)}% ` +
        `(${this.formatBytes(heapStats.used_heap_size)} / ${this.formatBytes(heapStats.heap_size_limit)})`
      );
      
      if (this.gcAfterThreshold && global.gc) {
        this.logger.warn('Triggering emergency garbage collection');
        this.forceGarbageCollection();
      }
    } else if (heapUsedRatio >= this.warningThreshold) {
      this.logger.warn(
        `WARNING: Memory usage at ${(heapUsedRatio * 100).toFixed(2)}% ` +
        `(${this.formatBytes(heapStats.used_heap_size)} / ${this.formatBytes(heapStats.heap_size_limit)})`
      );
    }

    if (externalMemoryMB > 500) {
      this.logger.warn(`High external memory usage: ${externalMemoryMB.toFixed(2)} MB`);
    }

    if (rssMemoryMB > 2048) {
      this.logger.warn(`High RSS memory usage: ${rssMemoryMB.toFixed(2)} MB`);
    }
  }

  /**
   * Perform cleanup operations
   */
  private performCleanup(): void {
    const before = process.memoryUsage();
    
    if (global.gc) {
      global.gc();
      
      const after = process.memoryUsage();
      const freedMB = (before.heapUsed - after.heapUsed) / 1024 / 1024;
      
      if (freedMB > 1) {
        this.logger.log(`Cleanup freed ${freedMB.toFixed(2)} MB of memory`);
      }
    }
  }

  /**
   * Force garbage collection
   */
  private forceGarbageCollection(): void {
    if (!global.gc) {
      this.logger.warn('Garbage collection is not exposed. Run with --expose-gc flag.');
      return;
    }

    const before = process.memoryUsage();
    global.gc();
    const after = process.memoryUsage();

    const freedMB = (before.heapUsed - after.heapUsed) / 1024 / 1024;
    this.logger.log(`Forced GC freed ${freedMB.toFixed(2)} MB`);
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): {
    heap: ReturnType<typeof v8.getHeapStatistics>;
    process: NodeJS.MemoryUsage;
    usage: {
      heapUsedPercent: number;
      heapUsedMB: number;
      heapTotalMB: number;
      rssMB: number;
      externalMB: number;
    };
  } {
    const heapStats = v8.getHeapStatistics();
    const memoryUsage = process.memoryUsage();

    return {
      heap: heapStats,
      process: memoryUsage,
      usage: {
        heapUsedPercent: (heapStats.used_heap_size / heapStats.heap_size_limit) * 100,
        heapUsedMB: heapStats.used_heap_size / 1024 / 1024,
        heapTotalMB: heapStats.total_heap_size / 1024 / 1024,
        rssMB: memoryUsage.rss / 1024 / 1024,
        externalMB: memoryUsage.external / 1024 / 1024,
      },
    };
  }

  /**
   * Get heap snapshot (expensive operation)
   */
  getHeapSnapshot(): NodeJS.ReadableStream {
    this.logger.log('Generating heap snapshot (this may take a moment)...');
    return v8.getHeapSnapshot();
  }

  /**
   * Write heap snapshot to file
   */
  async writeHeapSnapshot(filePath: string): Promise<void> {
    const snapshot = this.getHeapSnapshot();
    const stream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      snapshot.pipe(stream);
      snapshot.on('end', () => {
        this.logger.log(`Heap snapshot written to ${filePath}`);
        resolve();
      });
      snapshot.on('error', reject);
    });
  }

  /**
   * Log initial memory statistics
   */
  private logInitialMemoryStats(): void {
    const stats = this.getMemoryStats();
    
    this.logger.log('Initial Memory Configuration:');
    this.logger.log(`  Heap Size Limit: ${this.formatBytes(stats.heap.heap_size_limit)}`);
    this.logger.log(`  Total Heap Size: ${this.formatBytes(stats.heap.total_heap_size)}`);
    this.logger.log(`  Used Heap Size: ${this.formatBytes(stats.heap.used_heap_size)}`);
    this.logger.log(`  RSS: ${stats.usage.rssMB.toFixed(2)} MB`);
    this.logger.log(`  External: ${stats.usage.externalMB.toFixed(2)} MB`);
    this.logger.log(`  Warning Threshold: ${(this.warningThreshold * 100).toFixed(0)}%`);
    this.logger.log(`  Critical Threshold: ${(this.criticalThreshold * 100).toFixed(0)}%`);
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
  }

  /**
   * Check if memory usage is healthy
   */
  isMemoryHealthy(): boolean {
    const stats = this.getMemoryStats();
    const heapUsedRatio = stats.heap.used_heap_size / stats.heap.heap_size_limit;
    return heapUsedRatio < this.warningThreshold;
  }

  /**
   * Get memory health status
   */
  getMemoryHealth(): {
    status: 'healthy' | 'warning' | 'critical';
    heapUsedPercent: number;
    message: string;
  } {
    const stats = this.getMemoryStats();
    const heapUsedRatio = stats.heap.used_heap_size / stats.heap.heap_size_limit;

    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    let message = 'Memory usage is within normal limits';

    if (heapUsedRatio >= this.criticalThreshold) {
      status = 'critical';
      message = 'Memory usage is critically high';
    } else if (heapUsedRatio >= this.warningThreshold) {
      status = 'warning';
      message = 'Memory usage is elevated';
    }

    return {
      status,
      heapUsedPercent: heapUsedRatio * 100,
      message,
    };
  }
}
