import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PerformanceMetric } from './entities/performance-metric.entity';
import { SystemAlert } from './entities/system-alert.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Monitoring Module
 * System performance monitoring and alerting
 * Features:
 * - Real-time performance metrics collection
 * - System health alerts and notifications
 * - Anomaly detection and thresholds
 * - Historical metrics and trend analysis
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([PerformanceMetric, SystemAlert]),
    AuthModule,
  ],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
