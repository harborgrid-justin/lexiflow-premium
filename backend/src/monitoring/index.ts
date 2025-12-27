/**
 * Monitoring Module Exports
 * Enterprise-grade monitoring, logging, and observability
 */

// Services
export { StructuredLoggerService } from './services/structured.logger.service';
export { MetricsCollectorService } from './services/metrics.collector.service';
export { AlertingService } from './services/alerting.service';
export { DistributedTracingService } from './services/distributed.tracing.service';
export { HealthAggregatorService } from './services/health.aggregator.service';

// Interceptors
export { PerformanceInterceptor } from './interceptors/performance.interceptor';

// Controllers
export { MetricsController } from './controllers/metrics.controller';

// Module
export { MonitoringModule } from './monitoring.module';

// Types
export type { LogContext } from './services/structured.logger.service';
export type { MetricPoint, HistogramData } from './services/metrics.collector.service';
export type { AlertThreshold, AlertChannel, AlertRule } from './services/alerting.service';
export type { TraceContext, SpanOptions } from './services/distributed.tracing.service';
export type { HealthStatus, HealthCheck } from './services/health.aggregator.service';
