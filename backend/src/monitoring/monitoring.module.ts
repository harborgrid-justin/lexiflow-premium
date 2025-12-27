import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { MetricsController } from './controllers/metrics.controller';
import { MemoryManagementController } from './memory-management.controller';
import { PerformanceMetric } from './entities/performance-metric.entity';
import { SystemAlert } from './entities/system-alert.entity';
import { AuthModule } from '../auth/auth.module';
import { StructuredLoggerService } from './services/structured.logger.service';
import { MetricsCollectorService } from './services/metrics.collector.service';
import { AlertingService } from './services/alerting.service';
import { DistributedTracingService } from './services/distributed.tracing.service';
import { HealthAggregatorService } from './services/health.aggregator.service';
import { PerformanceInterceptor } from './interceptors/performance.interceptor';
import { MemoryManagementModule } from '../common/memory-management.module';

/**
 * Monitoring Module
 * Enterprise-grade monitoring, logging, and observability
 * Features:
 * - Structured JSON logging with PII redaction
 * - Prometheus-compatible metrics collection
 * - Real-time alerting with multiple channels
 * - OpenTelemetry distributed tracing
 * - Comprehensive health checks
 * - Performance tracking and analysis
 */
@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceMetric, SystemAlert]),
    AuthModule,
    MemoryManagementModule,
  ],
  controllers: [
    MonitoringController,
    MetricsController,
    MemoryManagementController,
  ],
  providers: [
    MonitoringService,
    StructuredLoggerService,
    MetricsCollectorService,
    AlertingService,
    DistributedTracingService,
    HealthAggregatorService,
    PerformanceInterceptor,
  ],
  exports: [
    MonitoringService,
    StructuredLoggerService,
    MetricsCollectorService,
    AlertingService,
    DistributedTracingService,
    HealthAggregatorService,
    PerformanceInterceptor,
  ],
})
export class MonitoringModule {}
