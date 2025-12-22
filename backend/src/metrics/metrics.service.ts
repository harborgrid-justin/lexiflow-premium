import { Injectable, Logger } from '@nestjs/common';

interface MetricData {
  name: string;
  type: 'counter' | 'gauge' | 'histogram';
  value: number;
  labels?: Record<string, string>;
  timestamp: Date;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private metrics: Map<string, MetricData> = new Map();

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
