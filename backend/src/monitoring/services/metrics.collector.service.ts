import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformanceMetric } from '../entities/performance-metric.entity';
import * as os from 'os';

export interface MetricPoint {
  name: string;
  value: number;
  labels?: Record<string, string>;
  timestamp?: Date;
}

export interface HistogramData {
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

/**
 * Metrics Collector Service
 * Collects and aggregates application metrics for monitoring and observability
 * Provides Prometheus-compatible metrics export
 * 
 * MEMORY OPTIMIZATIONS:
 * - LRU eviction with 10K entry limits per Map
 * - Periodic flush to database (5 minutes)
 * - Array bounds enforcement (1K max per histogram)
 * - Proper cleanup on module destroy
 */
@Injectable()
export class MetricsCollectorService implements OnModuleDestroy {
  private readonly logger = new Logger(MetricsCollectorService.name);
  
  // Memory limits
  private readonly MAX_METRICS_PER_MAP = 10000;
  private readonly MAX_HISTOGRAM_VALUES = 1000;
  private readonly MAX_REQUEST_DURATIONS = 1000;
  private readonly FLUSH_INTERVAL_MS = 300000; // 5 minutes
  
  private metrics: Map<string, number[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, number[]> = new Map();
  private lastMetricFlush: Date = new Date();

  // Request metrics
  private requestCounts: Map<string, number> = new Map();
  private requestDurations: Map<string, number[]> = new Map();
  private errorCounts: Map<string, number> = new Map();

  // Database metrics
  private queryDurations: number[] = [];
  private queryCount = 0;
  private queryErrors = 0;

  // Cache metrics
  private cacheHits = 0;
  private cacheMisses = 0;

  // Interval tracking for cleanup
  private systemMetricsInterval: NodeJS.Timeout | null = null;
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(PerformanceMetric)
    private readonly metricRepository: Repository<PerformanceMetric>,
  ) {
    // Start periodic system metrics collection
    this.startSystemMetricsCollection();
    // Start periodic flush to database
    this.startPeriodicFlush();
  }

  onModuleDestroy() {
    this.logger.log('Cleaning up metrics collector...');
    
    // Clear intervals
    if (this.systemMetricsInterval) {
      clearInterval(this.systemMetricsInterval);
      this.systemMetricsInterval = null;
    }
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    
    // Clear all Maps and arrays
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.requestCounts.clear();
    this.requestDurations.clear();
    this.errorCounts.clear();
    this.queryDurations.length = 0;
    
    this.logger.log('Metrics collector cleanup complete');
  }

  /**
   * Start collecting system metrics periodically
   */
  private startSystemMetricsCollection(): void {
    this.systemMetricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000); // Collect every 30 seconds
  }

  /**
   * Start periodic flush to database
   */
  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(async () => {
      try {
        await this.persistMetrics();
        this.logger.log('Metrics flushed to database');
      } catch (error) {
        this.logger.error('Failed to flush metrics', error);
      }
    }, this.FLUSH_INTERVAL_MS);
  }

  /**
   * Collect system-level metrics (CPU, memory, etc.)
   */
  private collectSystemMetrics(): void {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach((cpu) => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const cpuUsage = 100 - (100 * totalIdle) / totalTick;
    this.recordGauge('system.cpu.usage.percent', cpuUsage);

    // Memory metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    this.recordGauge('system.memory.total.bytes', totalMemory);
    this.recordGauge('system.memory.free.bytes', freeMemory);
    this.recordGauge('system.memory.used.bytes', usedMemory);
    this.recordGauge('system.memory.usage.percent', memoryUsagePercent);

    // Process metrics
    const processMemory = process.memoryUsage();
    this.recordGauge('process.memory.heap.used.bytes', processMemory.heapUsed);
    this.recordGauge('process.memory.heap.total.bytes', processMemory.heapTotal);
    this.recordGauge('process.memory.rss.bytes', processMemory.rss);
    this.recordGauge('process.memory.external.bytes', processMemory.external);

    // Uptime
    this.recordGauge('system.uptime.seconds', os.uptime());
    this.recordGauge('process.uptime.seconds', process.uptime());
  }

  /**
   * Increment a counter metric with LRU eviction
   */
  incrementCounter(name: string, value: number = 1, labels?: Record<string, string>): void {
    const key = this.buildMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    // LRU eviction if size exceeds limit
    this.enforceLRULimit(this.counters, this.MAX_METRICS_PER_MAP);
  }

  /**
   * Record a gauge metric (point-in-time value) with LRU eviction
   */
  recordGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildMetricKey(name, labels);
    this.gauges.set(key, value);
    
    // LRU eviction if size exceeds limit
    this.enforceLRULimit(this.gauges, this.MAX_METRICS_PER_MAP);
  }

  /**
   * Record a histogram metric (distribution of values) with size limits
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildMetricKey(name, labels);
    const values = this.histograms.get(key) || [];
    values.push(value);
    this.histograms.set(key, values);

    // Keep only last N values to prevent memory issues
    if (values.length > this.MAX_HISTOGRAM_VALUES) {
      values.shift();
    }
    
    // LRU eviction if too many histograms
    this.enforceLRULimit(this.histograms, this.MAX_METRICS_PER_MAP);
  }

  /**
   * Enforce LRU eviction on a Map when size exceeds limit
   */
  private enforceLRULimit<K, V>(map: Map<K, V>, maxSize: number): void {
    if (map.size > maxSize) {
      const keysToDelete = Math.floor(maxSize * 0.1); // Remove oldest 10%
      const iterator = map.keys();
      for (let i = 0; i < keysToDelete; i++) {
        const key = iterator.next().value;
        if (key !== undefined) {
          map.delete(key);
        }
      }
      this.logger.warn(`LRU eviction: removed ${keysToDelete} entries from Map (size: ${map.size})`);
    }
  }

  /**
   * Build metric key from name and labels
   */
  private buildMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelString = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}="${value}"`)
      .join(',');

    return `${name}{${labelString}}`;
  }

  /**
   * Record HTTP request metrics with bounded storage
   */
  recordRequest(method: string, path: string, statusCode: number, duration: number): void {
    const endpoint = `${method} ${this.normalizePath(path)}`;

    // Increment request counter
    const requestKey = this.buildMetricKey('http.requests.total', {
      method,
      path: this.normalizePath(path),
      status: statusCode.toString(),
    });
    this.incrementCounter(requestKey);

    // Record duration histogram
    const durationKey = this.buildMetricKey('http.request.duration.ms', {
      method,
      path: this.normalizePath(path),
    });
    this.recordHistogram(durationKey, duration);

    // Track errors
    if (statusCode >= 400) {
      const errorKey = this.buildMetricKey('http.requests.errors.total', {
        method,
        path: this.normalizePath(path),
        status: statusCode.toString(),
      });
      this.incrementCounter(errorKey);
    }

    // Store for endpoint-specific tracking with LRU
    const count = this.requestCounts.get(endpoint) || 0;
    this.requestCounts.set(endpoint, count + 1);
    this.enforceLRULimit(this.requestCounts, this.MAX_METRICS_PER_MAP);

    const durations = this.requestDurations.get(endpoint) || [];
    durations.push(duration);
    
    // Keep only last N durations per endpoint
    if (durations.length > this.MAX_REQUEST_DURATIONS) {
      durations.shift();
    }
    
    this.requestDurations.set(endpoint, durations);
    this.enforceLRULimit(this.requestDurations, this.MAX_METRICS_PER_MAP);

    if (statusCode >= 400) {
      const errors = this.errorCounts.get(endpoint) || 0;
      this.errorCounts.set(endpoint, errors + 1);
      this.enforceLRULimit(this.errorCounts, this.MAX_METRICS_PER_MAP);
    }
  }

  /**
   * Normalize URL path for metrics (remove IDs and query params)
   */
  private normalizePath(path: string): string {
    return path
      .split('?')[0] // Remove query params
      .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id') // UUID
      .replace(/\/\d+/g, '/:id'); // Numeric IDs
  }

  /**
   * Record database query metrics with bounded storage
   */
  recordDatabaseQuery(duration: number, success: boolean = true): void {
    this.queryCount++;
    this.queryDurations.push(duration);

    // Keep only last N queries to prevent unbounded growth
    if (this.queryDurations.length > this.MAX_HISTOGRAM_VALUES) {
      this.queryDurations.shift();
    }

    if (!success) {
      this.queryErrors++;
    }

    this.recordHistogram('database.query.duration.ms', duration);
    this.incrementCounter('database.queries.total');

    if (!success) {
      this.incrementCounter('database.queries.errors.total');
    }

    // Alert on slow queries
    if (duration > 1000) {
      this.incrementCounter('database.queries.slow.total');
    }
  }

  /**
   * Record cache hit/miss
   */
  recordCacheAccess(hit: boolean): void {
    if (hit) {
      this.cacheHits++;
      this.incrementCounter('cache.hits.total');
    } else {
      this.cacheMisses++;
      this.incrementCounter('cache.misses.total');
    }

    const total = this.cacheHits + this.cacheMisses;
    if (total > 0) {
      const hitRatio = this.cacheHits / total;
      this.recordGauge('cache.hit.ratio', hitRatio);
    }
  }

  /**
   * Get current metrics snapshot
   */
  getMetricsSnapshot(): any {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: this.getHistogramStats(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate histogram statistics
   */
  private getHistogramStats(): Record<string, HistogramData> {
    const stats: Record<string, HistogramData> = {};

    this.histograms.forEach((values, key) => {
      if (values.length === 0) {
        return;
      }

      const sorted = [...values].sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);

      stats[key] = {
        count: values.length,
        sum,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        avg: sum / values.length,
        p50: this.percentile(sorted, 0.5),
        p95: this.percentile(sorted, 0.95),
        p99: this.percentile(sorted, 0.99),
      };
    });

    return stats;
  }

  /**
   * Calculate percentile from sorted array
   */
  private percentile(sortedValues: number[], p: number): number {
    if (sortedValues.length === 0) return 0;
    const index = Math.ceil(sortedValues.length * p) - 1;
    return sortedValues[Math.max(0, index)];
  }

  /**
   * Export metrics in Prometheus format
   */
  exportPrometheusMetrics(): string {
    const lines: string[] = [];

    // Counters
    this.counters.forEach((value, key) => {
      lines.push(`# TYPE ${key.split('{')[0]} counter`);
      lines.push(`${key} ${value}`);
    });

    // Gauges
    this.gauges.forEach((value, key) => {
      lines.push(`# TYPE ${key.split('{')[0]} gauge`);
      lines.push(`${key} ${value}`);
    });

    // Histograms
    const histogramStats = this.getHistogramStats();
    Object.entries(histogramStats).forEach(([key, stats]) => {
      const baseName = key.split('{')[0];
      const labels = key.includes('{') ? key.substring(key.indexOf('{')) : '';

      lines.push(`# TYPE ${baseName} histogram`);
      lines.push(`${baseName}_count${labels} ${stats.count}`);
      lines.push(`${baseName}_sum${labels} ${stats.sum}`);
      lines.push(`${baseName}_min${labels} ${stats.min}`);
      lines.push(`${baseName}_max${labels} ${stats.max}`);
      lines.push(`${baseName}_avg${labels} ${stats.avg}`);
      lines.push(`${baseName}_p50${labels} ${stats.p50}`);
      lines.push(`${baseName}_p95${labels} ${stats.p95}`);
      lines.push(`${baseName}_p99${labels} ${stats.p99}`);
    });

    return lines.join('\n') + '\n';
  }

  /**
   * Get request statistics by endpoint
   */
  getRequestStats(): any {
    const stats: any = {};

    this.requestCounts.forEach((count, endpoint) => {
      const durations = this.requestDurations.get(endpoint) || [];
      const errors = this.errorCounts.get(endpoint) || 0;
      const sorted = [...durations].sort((a, b) => a - b);
      const sum = durations.reduce((a, b) => a + b, 0);

      stats[endpoint] = {
        count,
        errors,
        errorRate: count > 0 ? errors / count : 0,
        avgDuration: durations.length > 0 ? sum / durations.length : 0,
        minDuration: sorted[0] || 0,
        maxDuration: sorted[sorted.length - 1] || 0,
        p50: this.percentile(sorted, 0.5),
        p95: this.percentile(sorted, 0.95),
        p99: this.percentile(sorted, 0.99),
      };
    });

    return stats;
  }

  /**
   * Get database statistics
   */
  getDatabaseStats(): any {
    const sorted = [...this.queryDurations].sort((a, b) => a - b);
    const sum = this.queryDurations.reduce((a, b) => a + b, 0);

    return {
      totalQueries: this.queryCount,
      totalErrors: this.queryErrors,
      errorRate: this.queryCount > 0 ? this.queryErrors / this.queryCount : 0,
      avgDuration: this.queryDurations.length > 0 ? sum / this.queryDurations.length : 0,
      minDuration: sorted[0] || 0,
      maxDuration: sorted[sorted.length - 1] || 0,
      p50: this.percentile(sorted, 0.5),
      p95: this.percentile(sorted, 0.95),
      p99: this.percentile(sorted, 0.99),
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): any {
    const total = this.cacheHits + this.cacheMisses;
    return {
      hits: this.cacheHits,
      misses: this.cacheMisses,
      total,
      hitRatio: total > 0 ? this.cacheHits / total : 0,
    };
  }

  /**
   * Reset all metrics (useful for testing)
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.requestCounts.clear();
    this.requestDurations.clear();
    this.errorCounts.clear();
    this.queryDurations = [];
    this.queryCount = 0;
    this.queryErrors = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Persist metrics to database
   */
  async persistMetrics(): Promise<void> {
    const snapshot = this.getMetricsSnapshot();
    const timestamp = new Date();

    const metricsToSave: any[] = [];

    // Save counters
    for (const [name, value] of Object.entries(snapshot.counters)) {
      metricsToSave.push({
        metricName: name,
        value: value as number,
        unit: 'count',
        timestamp,
      });
    }

    // Save gauges
    for (const [name, value] of Object.entries(snapshot.gauges)) {
      metricsToSave.push({
        metricName: name,
        value: value as number,
        unit: 'gauge',
        timestamp,
      });
    }

    if (metricsToSave.length > 0) {
      await this.metricRepository.save(metricsToSave);
      this.lastMetricFlush = timestamp;
    }
  }
}
