/**
 * Memory Leak Detector Service
 * Automated detection of memory leaks using heap diff analysis
 * 
 * @module common/services/memory-leak-detector
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as v8 from 'v8';
import { getMemoryStats, MemoryStats } from '@common/utils/memory-management.utils';

export interface HeapSnapshot {
  timestamp: number;
  stats: MemoryStats;
  heapSpaces: v8.HeapSpaceInfo[];
}

export interface MemoryLeak {
  type: 'heap-growth' | 'retained-objects' | 'detached-dom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  currentValue: number;
  previousValue?: number;
  threshold: number;
  timestamp: number;
}

export interface LeakDetectionConfig {
  enabled: boolean;
  checkIntervalMs: number;
  heapGrowthThresholdMB: number;
  retentionCheckCount: number;
  autoGcOnLeak: boolean;
}

const DEFAULT_CONFIG: LeakDetectionConfig = {
  enabled: true,
  checkIntervalMs: 300000, // 5 minutes
  heapGrowthThresholdMB: 50,
  retentionCheckCount: 3,
  autoGcOnLeak: false,
};

@Injectable()
export class MemoryLeakDetectorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MemoryLeakDetectorService.name);
  private config: LeakDetectionConfig = DEFAULT_CONFIG;
  
  private snapshots: HeapSnapshot[] = [];
  private detectedLeaks: MemoryLeak[] = [];
  private monitorInterval: NodeJS.Timeout | null = null;
  
  private readonly MAX_SNAPSHOTS = 20;
  private readonly MAX_LEAKS_HISTORY = 100;
  
  async onModuleInit() {
    if (this.config.enabled) {
      this.startMonitoring();
      this.logger.log('Memory leak detector started');
    }
  }
  
  async onModuleDestroy() {
    this.stopMonitoring();
    this.snapshots.length = 0;
    this.detectedLeaks.length = 0;
    this.logger.log('Memory leak detector stopped');
  }
  
  /**
   * Configure leak detector
   */
  configure(config: Partial<LeakDetectionConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled && !this.monitorInterval) {
      this.startMonitoring();
    } else if (!this.config.enabled && this.monitorInterval) {
      this.stopMonitoring();
    }
  }
  
  /**
   * Start monitoring for leaks
   */
  private startMonitoring(): void {
    this.monitorInterval = setInterval(
      () => this.checkForLeaks(),
      this.config.checkIntervalMs,
    );
    
    this.logger.log(
      `Monitoring started (interval: ${this.config.checkIntervalMs}ms, ` +
      `threshold: ${this.config.heapGrowthThresholdMB}MB)`,
    );
  }
  
  /**
   * Stop monitoring
   */
  private stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
      this.logger.log('Monitoring stopped');
    }
  }
  
  /**
   * Take heap snapshot
   */
  takeSnapshot(): HeapSnapshot {
    const snapshot: HeapSnapshot = {
      timestamp: Date.now(),
      stats: getMemoryStats(),
      heapSpaces: v8.getHeapSpaceStatistics(),
    };
    
    this.snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.MAX_SNAPSHOTS) {
      this.snapshots.shift();
    }
    
    return snapshot;
  }
  
  /**
   * Check for memory leaks
   */
  async checkForLeaks(): Promise<MemoryLeak[]> {
    const currentSnapshot = this.takeSnapshot();
    const leaks: MemoryLeak[] = [];
    
    if (this.snapshots.length < 2) {
      this.logger.debug('Not enough snapshots for leak detection');
      return leaks;
    }
    
    // Check for steady heap growth
    const heapGrowthLeak = this.detectHeapGrowth(currentSnapshot);
    if (heapGrowthLeak) {
      leaks.push(heapGrowthLeak);
    }
    
    // Check for retained objects
    const retainedLeak = this.detectRetainedObjects(currentSnapshot);
    if (retainedLeak) {
      leaks.push(retainedLeak);
    }
    
    // Log and store leaks
    for (const leak of leaks) {
      this.logger.warn(
        `LEAK DETECTED [${leak.severity.toUpperCase()}]: ${leak.description}`,
      );
      
      this.detectedLeaks.push(leak);
      
      // Trim leak history
      if (this.detectedLeaks.length > this.MAX_LEAKS_HISTORY) {
        this.detectedLeaks.shift();
      }
      
      // Auto GC if configured
      if (this.config.autoGcOnLeak && global.gc) {
        this.logger.log('Triggering garbage collection due to detected leak');
        global.gc();
      }
    }
    
    return leaks;
  }
  
  /**
   * Detect steady heap growth (potential leak)
   */
  private detectHeapGrowth(currentSnapshot: HeapSnapshot): MemoryLeak | null {
    if (this.snapshots.length < this.config.retentionCheckCount) {
      return null;
    }
    
    // Get recent snapshots
    const recentSnapshots = this.snapshots.slice(-this.config.retentionCheckCount);
    
    // Check if heap is consistently growing
    let isGrowing = true;
    let totalGrowth = 0;
    
    for (let i = 1; i < recentSnapshots.length; i++) {
      const prev = recentSnapshots[i - 1].stats.heapUsedMB;
      const curr = recentSnapshots[i].stats.heapUsedMB;
      const growth = curr - prev;
      
      if (growth < 0) {
        isGrowing = false;
        break;
      }
      
      totalGrowth += growth;
    }
    
    if (isGrowing && totalGrowth > this.config.heapGrowthThresholdMB) {
      const severity = this.calculateSeverity(
        totalGrowth,
        this.config.heapGrowthThresholdMB,
      );
      
      return {
        type: 'heap-growth',
        severity,
        description: `Steady heap growth detected: ${totalGrowth.toFixed(1)}MB over ${this.config.retentionCheckCount} checks`,
        currentValue: currentSnapshot.stats.heapUsedMB,
        previousValue: recentSnapshots[0].stats.heapUsedMB,
        threshold: this.config.heapGrowthThresholdMB,
        timestamp: Date.now(),
      };
    }
    
    return null;
  }
  
  /**
   * Detect retained objects (memory not being released)
   */
  private detectRetainedObjects(currentSnapshot: HeapSnapshot): MemoryLeak | null {
    if (this.snapshots.length < 2) {
      return null;
    }
    
    const previousSnapshot = this.snapshots[this.snapshots.length - 2];
    
    // Check for large increase in array buffers (often indicates retained data)
    const prevBuffers = previousSnapshot.stats.arrayBuffers;
    const currBuffers = currentSnapshot.stats.arrayBuffers;
    const bufferGrowth = (currBuffers - prevBuffers) / (1024 * 1024);
    
    if (bufferGrowth > 10) {
      // More than 10MB growth in array buffers
      return {
        type: 'retained-objects',
        severity: 'medium',
        description: `Significant array buffer growth: ${bufferGrowth.toFixed(1)}MB`,
        currentValue: currBuffers,
        previousValue: prevBuffers,
        threshold: 10 * 1024 * 1024,
        timestamp: Date.now(),
      };
    }
    
    return null;
  }
  
  /**
   * Calculate severity based on threshold exceeded
   */
  private calculateSeverity(
    value: number,
    threshold: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = value / threshold;
    
    if (ratio >= 3) return 'critical';
    if (ratio >= 2) return 'high';
    if (ratio >= 1.5) return 'medium';
    return 'low';
  }
  
  /**
   * Get recent leaks
   */
  getRecentLeaks(limit: number = 10): MemoryLeak[] {
    return this.detectedLeaks.slice(-limit);
  }
  
  /**
   * Get all snapshots
   */
  getSnapshots(): HeapSnapshot[] {
    return [...this.snapshots];
  }
  
  /**
   * Clear leak history
   */
  clearHistory(): void {
    this.detectedLeaks.length = 0;
    this.snapshots.length = 0;
    this.logger.log('Leak history cleared');
  }
  
  /**
   * Get leak statistics
   */
  getStatistics(): {
    totalLeaksDetected: number;
    leaksByType: Record<string, number>;
    leaksBySeverity: Record<string, number>;
    currentSnapshots: number;
  } {
    const leaksByType: Record<string, number> = {};
    const leaksBySeverity: Record<string, number> = {};
    
    for (const leak of this.detectedLeaks) {
      leaksByType[leak.type] = (leaksByType[leak.type] || 0) + 1;
      leaksBySeverity[leak.severity] = (leaksBySeverity[leak.severity] || 0) + 1;
    }
    
    return {
      totalLeaksDetected: this.detectedLeaks.length,
      leaksByType,
      leaksBySeverity,
      currentSnapshots: this.snapshots.length,
    };
  }
}
