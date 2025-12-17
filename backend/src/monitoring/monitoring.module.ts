import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonitoringController } from './monitoring.controller';
import { MonitoringService } from './monitoring.service';
import { PerformanceMetric } from './entities/performance-metric.entity';
import { SystemAlert } from './entities/system-alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerformanceMetric, SystemAlert])],
  controllers: [MonitoringController],
  providers: [MonitoringService],
  exports: [MonitoringService],
})
export class MonitoringModule {}
