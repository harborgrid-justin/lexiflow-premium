/**
 * Manual GC Service
 * 
 * PhD-Grade Memory Management: Strategically trigger manual garbage collection
 * after releasing massive resources to prevent fragmentation.
 * 
 * @module ManualGCService
 * @category Performance - Memory Management
 * 
 * When to Use:
 * - After completing large OCR batch jobs
 * - After generating massive PDF exports
 * - After processing large file uploads
 * - After bulk database operations
 * 
 * WARNING: Manual GC is expensive (10-100ms). Only use after releasing
 * resources that would otherwise fragment the heap.
 * 
 * Example Scenario:
 * - Process 100 OCR jobs = allocates 5GB temp memory
 * - Without manual GC: Fragmented heap, slow future allocations
 * - With manual GC: Compact heap, fast future allocations
 */

import { Injectable, Logger } from '@nestjs/common';

export interface GCStats {
  /** Whether manual GC is available */
  available: boolean;
  /** Number of manual GC triggers */
  manualTriggers: number;
  /** Last GC timestamp */
  lastGC: Date | null;
  /** Heap statistics before/after GC */
  heapStats?: {
    before: NodeJS.MemoryUsage;
    after: NodeJS.MemoryUsage;
    freed: number;
  };
}

@Injectable()
export class ManualGCService {
  private readonly logger = new Logger(ManualGCService.name);
  private stats: GCStats = {
    available: typeof global.gc === 'function',
    manualTriggers: 0,
    lastGC: null,
  };

  constructor() {
    if (!this.stats.available) {
      this.logger.warn(
        'Manual GC not available. Start Node with --expose-gc flag to enable.'
      );
    }
  }

  /**
   * Trigger manual garbage collection
   * 
   * @param reason - Reason for triggering GC (for logging)
   * @param force - Force GC even if recently triggered
   * @returns Whether GC was executed
   * 
   * @example
   * ```typescript
   * // After batch OCR processing
   * await ocrService.processBatch(files);
   * await gcService.triggerGC('post-ocr-batch');
   * 
   * // After large export
   * await exportService.generateReport();
   * await gcService.triggerGC('post-report-generation');
   * ```
   */
  async triggerGC(reason: string, force: boolean = false): Promise<boolean> {
    if (!this.stats.available) {
      return false;
    }

    // Rate limiting: Don't GC more than once per minute unless forced
    if (!force && this.stats.lastGC) {
      const timeSinceLastGC = Date.now() - this.stats.lastGC.getTime();
      if (timeSinceLastGC < 60000) {
        this.logger.debug(
          `Skipping GC (triggered ${Math.round(timeSinceLastGC / 1000)}s ago)`
        );
        return false;
      }
    }

    const beforeHeap = process.memoryUsage();
    const startTime = Date.now();

    try {
      // Trigger full GC (gc is available due to isGCAvailable check above)
      const gcFunction = global.gc;
      if (gcFunction) {
        gcFunction();
      } else {
        // This should never happen due to isGCAvailable check
        this.logger.error('GC function not available despite isGCAvailable check');
        return false;
      }

      const afterHeap = process.memoryUsage();
      const duration = Date.now() - startTime;
      const freedMB = (beforeHeap.heapUsed - afterHeap.heapUsed) / 1024 / 1024;

      this.stats.manualTriggers++;
      this.stats.lastGC = new Date();
      this.stats.heapStats = {
        before: beforeHeap,
        after: afterHeap,
        freed: freedMB,
      };

      this.logger.log(
        `Manual GC triggered (${reason}): freed ${freedMB.toFixed(2)}MB in ${duration}ms`
      );

      return true;
    } catch (error) {
      this.logger.error('Failed to trigger manual GC', error);
      return false;
    }
  }

  /**
   * Get GC statistics
   */
  getStats(): GCStats {
    return { ...this.stats };
  }

  /**
   * Check if GC should be triggered based on heap usage
   * 
   * @param thresholdMB - Heap usage threshold in MB (default: 1024)
   * @returns Whether GC should be triggered
   */
  shouldTriggerGC(thresholdMB: number = 1024): boolean {
    const heapUsedMB = process.memoryUsage().heapUsed / 1024 / 1024;
    return heapUsedMB > thresholdMB;
  }

  /**
   * Auto-trigger GC if heap usage exceeds threshold
   * 
   * @param reason - Reason for potential GC
   * @param thresholdMB - Heap threshold in MB
   */
  async autoTriggerIfNeeded(reason: string, thresholdMB: number = 1024): Promise<boolean> {
    if (this.shouldTriggerGC(thresholdMB)) {
      return this.triggerGC(`auto-${reason}`, false);
    }
    return false;
  }
}
