import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AnalyticsDashboardController } from './analytics-dashboard.controller';
import { AnalyticsDashboardService } from './analytics-dashboard.service';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AnalyticsDashboardController],
  providers: [AnalyticsDashboardService],
  exports: [AnalyticsDashboardService]
})
export class AnalyticsDashboardModule {}
