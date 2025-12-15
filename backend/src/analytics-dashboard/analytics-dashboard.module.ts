import { Module } from '@nestjs/common';
import { AnalyticsDashboardController } from './analytics-dashboard.controller';

@Module({
  controllers: [AnalyticsDashboardController],
  providers: [],
  exports: []
})
export class AnalyticsDashboardModule {}
