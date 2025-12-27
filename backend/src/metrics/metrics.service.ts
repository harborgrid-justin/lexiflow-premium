import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

export interface MetricData {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

/**
 * Metrics Service with Memory Optimizations
 * 
 * MEMORY OPTIMIZATIONS:
 * - Max 10K metrics in memory
 * - TTL-based cleanup (1 hour)
 * - Proper cleanup on module destroy
 */
@Injectable()
export class MetricsService implements OnModuleDestroy {
  private readonly logger = new Logger(MetricsService.name);
  private readonly MAX_METRICS = 10000;
  private readonly METRICS_TTL_MS = 3600000; // 1 hour
  private metrics: Map<string, MetricData> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.cleanupInterval = setInterval(() => this.cleanupExpiredMetrics(), 300000); // Clean every 5 minutes
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.metrics.clear();
  }

  /**
   * Clean up expired metrics
   */
  private cleanupExpiredMetrics(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, metric] of this.metrics.entries()) {
      if (now - metric.timestamp.getTime() > this.METRICS_TTL_MS) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.metrics.delete(key));

    if (toDelete.length > 0) {
      this.logger.debug(`Cleaned up ${toDelete.length} expired metrics`);
    }
  }

  /**
   * Enforce memory limits
   */
  private enforceMemoryLimits(): void {
    if (this.metrics.size > this.MAX_METRICS) {
      // Remove oldest metrics (simple FIFO)
      const keys = Array.from(this.metrics.keys());
      const toRemove = Math.floor(this.MAX_METRICS * 0.1); // Remove 10%
      for (let i = 0; i < toRemove; i++) {
        this.metrics.delete(keys[i]);
      }
      this.logger.debug(`Enforced memory limits, removed ${toRemove} metrics`);
    }
  }

  recordMetric(name: string, value: number, type: MetricData['type'] = 'counter', labels?: Record<string, string>): void {
    const key = this.getMetricKey(name, labels);
    
    const existing = this.metrics.get(key);
    const newValue = type === 'counter' && existing ? existing.value + value : value;
    
    this.metrics.set(key, {
      name,
      type,
      value: newValue,
      labels,
      timestamp: new Date(),
    });

    this.enforceMemoryLimits();

    this.logger.debug(`Recorded metric: ${name} = ${newValue}`);
  }

  incrementCounter(name: string, labels?: Record<string, string>): void {
    this.recordMetric(name, 1, 'counter', labels);
  }

  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, value, 'gauge', labels);
  }

  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric(name, value, 'histogram', labels);
  }

  getMetric(name: string, labels?: Record<string, string>): MetricData | undefined {
    const key = this.getMetricKey(name, labels);
    return this.metrics.get(key);
  }

  getAllMetrics(): MetricData[] {
    return Array.from(this.metrics.values());
  }

  getMetricsJson(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    
    for (const [key, metric] of this.metrics) {
      result[key] = {
        value: metric.value,
        type: metric.type,
        labels: metric.labels,
        timestamp: metric.timestamp,
      };
    }

    return result;
  }

  getPrometheusMetrics(): string {
    let output = '';

    for (const metric of this.metrics.values()) {
      const labels = metric.labels 
        ? `{${Object.entries(metric.labels).map(([k, v]) => `${k}="${v}"`).join(',')}}` 
        : '';
      
      output += `# TYPE ${metric.name} ${metric.type}\n`;
      output += `${metric.name}${labels} ${metric.value}\n`;
    }

    return output;
  }

  getSystemMetrics(): any {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
      },
      uptime: uptime,
      timestamp: new Date(),
    };
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.logger.log('Metrics cleared');
  }

  private getMetricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }
}
