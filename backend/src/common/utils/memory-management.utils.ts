/**
 * Memory Management Utilities
 * Production-ready utilities for memory tracking, cleanup, and optimization
 * 
 * @module common/utils/memory-management
 */

import { Logger } from '@nestjs/common';

const logger = new Logger('MemoryManagement');

/**
 * Memory statistics interface
 */
export interface MemoryStats {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
  heapUsagePercent: number;
}

/**
 * Cleanup task interface
 */
export interface CleanupTask {
  name: string;
  cleanup: () => void | Promise<void>;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Memory threshold configuration
 */
export interface MemoryThresholds {
  warningPercent: number;
  criticalPercent: number;
  maxHeapMB: number;
}

/**
 * Default memory thresholds
 */
export const DEFAULT_MEMORY_THRESHOLDS: MemoryThresholds = {
  warningPercent: 75,
  criticalPercent: 85,
  maxHeapMB: 4096,
};

/**
 * Get current memory statistics
 */
export function getMemoryStats(): MemoryStats {
  const usage = process.memoryUsage();
  
  return {
    heapUsed: usage.heapUsed,
    heapTotal: usage.heapTotal,
    external: usage.external,
    arrayBuffers: usage.arrayBuffers,
    rss: usage.rss,
    heapUsedMB: bytesToMB(usage.heapUsed),
    heapTotalMB: bytesToMB(usage.heapTotal),
    rssMB: bytesToMB(usage.rss),
    heapUsagePercent: (usage.heapUsed / usage.heapTotal) * 100,
  };
}

/**
 * Check if memory usage exceeds thresholds
 */
export function checkMemoryThresholds(
  thresholds: MemoryThresholds = DEFAULT_MEMORY_THRESHOLDS,
): { status: 'ok' | 'warning' | 'critical'; stats: MemoryStats } {
  const stats = getMemoryStats();
  
  if (stats.heapUsagePercent >= thresholds.criticalPercent) {
    return { status: 'critical', stats };
  }
  
  if (stats.heapUsagePercent >= thresholds.warningPercent) {
    return { status: 'warning', stats };
  }
  
  return { status: 'ok', stats };
}

/**
 * Force garbage collection (if available)
 */
export function forceGarbageCollection(): boolean {
  if (global.gc) {
    logger.debug('Forcing garbage collection...');
    global.gc();
    return true;
  }
  
  logger.warn('Garbage collection not available. Start Node with --expose-gc flag.');
  return false;
}

/**
 * Clear large array efficiently
 */
export function clearArray<T>(arr: T[]): void {
  arr.length = 0;
}

/**
 * Clear Map efficiently
 */
export function clearMap<K, V>(map: Map<K, V>): void {
  map.clear();
}

/**
 * Clear Set efficiently
 */
export function clearSet<T>(set: Set<T>): void {
  set.clear();
}

/**
 * Clear WeakMap (cannot be cleared directly, but can be replaced)
 */
export function replaceWeakMap<K extends object, V>(): WeakMap<K, V> {
  return new WeakMap<K, V>();
}

/**
 * Clear multiple data structures
 */
export function clearDataStructures(structures: Array<Map<any, any> | Set<any> | any[]>): void {
  for (const structure of structures) {
    if (structure instanceof Map) {
      clearMap(structure);
    } else if (structure instanceof Set) {
      clearSet(structure);
    } else if (Array.isArray(structure)) {
      clearArray(structure);
    }
  }
}

/**
 * Create cleanup timeout with unref
 */
export function createUnrefTimeout(
  callback: () => void | Promise<void>,
  delay: number,
): NodeJS.Timeout {
  const timeout = setTimeout(async () => {
    try {
      await callback();
    } catch (error) {
      logger.error(`Cleanup timeout error: ${error}`);
    }
  }, delay);
  
  timeout.unref();
  return timeout;
}

/**
 * Create cleanup interval with proper tracking
 */
export function createManagedInterval(
  callback: () => void | Promise<void>,
  interval: number,
  name?: string,
): NodeJS.Timeout {
  const intervalId = setInterval(async () => {
    try {
      await callback();
    } catch (error) {
      logger.error(`Interval "${name || 'unnamed'}" error: ${error}`);
    }
  }, interval);
  
  return intervalId;
}

/**
 * Clear interval safely
 */
export function clearManagedInterval(intervalId: NodeJS.Timeout | null): void {
  if (intervalId) {
    clearInterval(intervalId);
  }
}

/**
 * Register cleanup task for graceful shutdown
 */
const cleanupTasks: CleanupTask[] = [];

export function registerCleanupTask(task: CleanupTask): void {
  cleanupTasks.push(task);
  logger.debug(`Registered cleanup task: ${task.name} (priority: ${task.priority})`);
}

/**
 * Execute all cleanup tasks
 */
export async function executeCleanupTasks(): Promise<void> {
  logger.log(`Executing ${cleanupTasks.length} cleanup tasks...`);
  
  // Sort by priority (high -> medium -> low)
  const priorityMap = { high: 0, medium: 1, low: 2 };
  const sortedTasks = [...cleanupTasks].sort(
    (a, b) => priorityMap[a.priority] - priorityMap[b.priority],
  );
  
  for (const task of sortedTasks) {
    try {
      logger.debug(`Executing cleanup task: ${task.name}`);
      await task.cleanup();
    } catch (error) {
      logger.error(`Cleanup task "${task.name}" failed: ${error}`);
    }
  }
  
  clearArray(cleanupTasks);
  logger.log('All cleanup tasks executed');
}

/**
 * Monitor memory usage and log warnings
 */
export function startMemoryMonitor(
  intervalMs: number = 60000,
  thresholds: MemoryThresholds = DEFAULT_MEMORY_THRESHOLDS,
): NodeJS.Timeout {
  return createManagedInterval(
    () => {
      const { status, stats } = checkMemoryThresholds(thresholds);
      
      if (status === 'critical') {
        logger.error(
          `CRITICAL: Memory usage at ${stats.heapUsagePercent.toFixed(1)}% ` +
          `(${stats.heapUsedMB.toFixed(0)}MB / ${stats.heapTotalMB.toFixed(0)}MB)`,
        );
        forceGarbageCollection();
      } else if (status === 'warning') {
        logger.warn(
          `WARNING: Memory usage at ${stats.heapUsagePercent.toFixed(1)}% ` +
          `(${stats.heapUsedMB.toFixed(0)}MB / ${stats.heapTotalMB.toFixed(0)}MB)`,
        );
      } else {
        logger.debug(
          `Memory OK: ${stats.heapUsagePercent.toFixed(1)}% ` +
          `(${stats.heapUsedMB.toFixed(0)}MB / ${stats.heapTotalMB.toFixed(0)}MB)`,
        );
      }
    },
    intervalMs,
    'MemoryMonitor',
  );
}

/**
 * Convert bytes to megabytes
 */
export function bytesToMB(bytes: number): number {
  return bytes / 1024 / 1024;
}

/**
 * Convert megabytes to bytes
 */
export function mbToBytes(mb: number): number {
  return mb * 1024 * 1024;
}

/**
 * Estimate object size in bytes (rough approximation)
 */
export function estimateObjectSize(obj: any): number {
  const seen = new WeakSet();
  
  function sizeOf(obj: any): number {
    if (obj === null || obj === undefined) return 0;
    
    // Primitives
    if (typeof obj === 'boolean') return 4;
    if (typeof obj === 'number') return 8;
    if (typeof obj === 'string') return obj.length * 2;
    
    // Avoid circular references
    if (typeof obj === 'object') {
      if (seen.has(obj)) return 0;
      seen.add(obj);
      
      let size = 0;
      
      // Arrays
      if (Array.isArray(obj)) {
        size += obj.length * 8; // Rough estimate
        for (const item of obj) {
          size += sizeOf(item);
        }
        return size;
      }
      
      // Objects
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          size += key.length * 2; // Key size
          size += sizeOf(obj[key]); // Value size
        }
      }
      
      return size;
    }
    
    return 0;
  }
  
  return sizeOf(obj);
}

/**
 * Create memory-safe cache with size limits
 */
export class MemorySafeCache<K, V> {
  private cache = new Map<K, { value: V; size: number; timestamp: number }>();
  private currentSize = 0;
  
  constructor(
    private maxSize: number = 100 * 1024 * 1024, // 100MB default
    private maxEntries: number = 10000,
  ) {}
  
  set(key: K, value: V): void {
    const size = estimateObjectSize(value);
    
    // Remove old entry if exists
    const existing = this.cache.get(key);
    if (existing) {
      this.currentSize -= existing.size;
    }
    
    // Evict if necessary
    while (
      this.cache.size >= this.maxEntries ||
      this.currentSize + size > this.maxSize
    ) {
      this.evictOldest();
    }
    
    this.cache.set(key, { value, size, timestamp: Date.now() });
    this.currentSize += size;
  }
  
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    return entry?.value;
  }
  
  delete(key: K): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.currentSize -= entry.size;
      return this.cache.delete(key);
    }
    return false;
  }
  
  clear(): void {
    this.cache.clear();
    this.currentSize = 0;
  }
  
  size(): number {
    return this.cache.size;
  }
  
  memorySize(): number {
    return this.currentSize;
  }
  
  private evictOldest(): void {
    let oldest: K | null = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldest = key;
      }
    }
    
    if (oldest !== null) {
      this.delete(oldest);
    }
  }
}

/**
 * Graceful shutdown handler
 */
export async function setupGracefulShutdown(
  app: any,
  signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'],
): Promise<void> {
  for (const signal of signals) {
    process.on(signal, async () => {
      logger.log(`Received ${signal}, starting graceful shutdown...`);
      
      try {
        // Execute cleanup tasks
        await executeCleanupTasks();
        
        // Close application
        await app.close();
        
        // Force GC one last time
        forceGarbageCollection();
        
        logger.log('Graceful shutdown complete');
        process.exit(0);
      } catch (error) {
        logger.error(`Shutdown error: ${error}`);
        process.exit(1);
      }
    });
  }
}
