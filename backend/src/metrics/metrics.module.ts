import { Module } from '@nestjs/common';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

/**
 * Metrics Module
 * Application performance monitoring and business metrics
 * Features:
 * - API endpoint performance tracking
 * - Business KPIs (cases opened, documents processed)
 * - System resource utilization
 * - Custom metrics collection and aggregation
 */
@Module({
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [MetricsService],
})
export class MetricsModule {}
