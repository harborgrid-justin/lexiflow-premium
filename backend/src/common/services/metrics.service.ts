import { Injectable } from '@nestjs/common';

/**
 * Metric Types
 */
export enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary',
}

/**
 * Metric Data
 */
export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels?: Record<string, string>;
  timestamp: number;
}

/**
 * Metrics Service
 * Collects and exposes Prometheus-compatible metrics
 * Tracks API performance, business metrics, and system health
 * 
 * @example
 * metricsService.incrementCounter('api.requests.total', { method: 'GET', endpoint: '/cases' });
 * metricsService.recordHistogram('api.response.time', 150, { endpoint: '/cases' });
 */
/**
 * ╔=================================================================================================================╗
 * ║METRICS                                                                                                          ║
 * ╠=================================================================================================================╣
 * ║                                                                                                                 ║
 * ║  External Request                   Controller                            Service                                ║
 * ║       │                                   │                                     │                                ║
 * ║       │  HTTP Endpoints                  │                                     │                                ║
 * ║       └───────────────────────────────────►                                     │                                ║
 * ║                                                                                                                 ║
 * ║                                                                 ┌───────────────┴───────────────┐                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          Repository                    Database                ║
 * ║                                                                 │                               │                ║
 * ║                                                                 ▼                               ▼                ║
 * ║                                                          PostgreSQL                                          ║
 * ║                                                                                                                 ║
 * ║  DATA IN:  Data input                                                                                         ║

 * ║                                                                                                                 ║
 * ║  DATA OUT: Data output                                                                                        ║

 * ║                                                                                                                 ║

 * ╚=================================================================================================================╝
 */

@Injectable()
export class MetricsService {
  // private readonly logger = new Logger(MetricsService.name);
  private metrics: Map<string, Metric[]> = new Map();
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();

  /**
   * Increment counter metric
   */
  incrementCounter(name: string, labels?: Record<string, string>, value: number = 1): void {
    const key = this.buildKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);

    this.recordMetric({
      name,
      type: MetricType.COUNTER,
      value: current + value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Set gauge metric (current value)
   */
  setGauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.gauges.set(key, value);

    this.recordMetric({
      name,
      type: MetricType.GAUGE,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Record histogram value (for distributions)
   */
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({
      name,
      type: MetricType.HISTOGRAM,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Record summary value
   */
  recordSummary(name: string, value: number, labels?: Record<string, string>): void {
    this.recordMetric({
      name,
      type: MetricType.SUMMARY,
      value,
      labels,
      timestamp: Date.now(),
    });
  }

  /**
   * Get all metrics in Prometheus format
   */
  getPrometheusMetrics(): string {
    let output = '';

    // Counters
    for (const [key, value] of this.counters.entries()) {
      const [name, labels] = this.parseKey(key);
      output += `${name}${this.formatLabels(labels)} ${value}\n`;
    }

    // Gauges
    for (const [key, value] of this.gauges.entries()) {
      const [name, labels] = this.parseKey(key);
      output += `${name}${this.formatLabels(labels)} ${value}\n`;
    }

    return output;
  }

  /**
   * Get metrics as JSON (for REST API)
   */
  getMetricsJson(): Record<string, unknown> {
    const result: Record<string, unknown> = {
      counters: {},
      gauges: {},
      timestamp: new Date().toISOString(),
    };

    for (const [key, value] of this.counters.entries()) {
      (result as any).counters[key] = value;
    }

    for (const [key, value] of this.gauges.entries()) {
      (result as any).gauges[key] = value;
    }

    return result;
  }

  /**
   * Get system metrics
   */
  getSystemMetrics(): SystemMetrics {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();

    return {
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        rss: memUsage.rss,
        external: memUsage.external,
      },
      cpu: {
        usage: process.cpuUsage(),
      },
      uptime,
      timestamp: Date.now(),
    };
  }

  /**
   * Reset all metrics (for testing)
   */
  reset(): void {
    this.metrics.clear();
    this.counters.clear();
    this.gauges.clear();
  }

  private recordMetric(metric: Metric): void {
    const history = this.metrics.get(metric.name) || [];
    history.push(metric);

    // Keep last 1000 entries per metric
    if (history.length > 1000) {
      history.shift();
    }

    this.metrics.set(metric.name, history);
  }

  private buildKey(name: string, labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return name;
    }

    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `${name}{${labelStr}}`;
  }

  private parseKey(key: string): [string, Record<string, string> | undefined] {
    const match = key.match(/^([^{]+)(?:\{(.+)\})?$/);
    if (!match) return [key, undefined];

    const [, name, labelStr] = match;
    if (!labelStr || !name) return [name ?? key, undefined];

    const labels: Record<string, string> = {};
    for (const pair of labelStr.split(',')) {
      const [k, v] = pair.split('=');
      if (k && v) {
        labels[k] = v.replace(/"/g, '');
      }
    }

    return [name, labels];
  }

  private formatLabels(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }

    const formatted = Object.entries(labels)
      .map(([k, v]) => `${k}="${v}"`)
      .join(',');

    return `{${formatted}}`;
  }
}

export interface SystemMetrics {
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  cpu: {
    usage: NodeJS.CpuUsage;
  };
  uptime: number;
  timestamp: number;
}
