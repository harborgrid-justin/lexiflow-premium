import { Module } from '@nestjs/common';
import { AnalyticsDashboardController } from './analytics-dashboard.controller';
import { AnalyticsDashboardService } from './analytics-dashboard.service';

@Module({
  imports: [],
  controllers: [AnalyticsDashboardController],
  providers: [AnalyticsDashboardService],
  exports: [AnalyticsDashboardService]
})
export class AnalyticsDashboardModule {}
